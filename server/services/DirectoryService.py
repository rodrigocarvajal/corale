import glob
import io
import os
import time
import zipfile
import pandas as pd

class DirectoryService:

    def __init__(self):
        self.EXPECTED_HALLMARK_GSEA_OUTPUT_FILES = 50
        self.EXPECTED_KEGG_GSEA_OUTPUT_FILES = 186

    def create_corale_dataset_list(self):
        datasets = []

        datasets_raw = glob.glob('../data/*.txt')
        for dataset in datasets_raw:
            datasets.append(dataset.split('/')[-1].replace('_corale.txt', ''))

        return datasets

    def get_gsea_plot_list(self, jobDir, jobId, geneset):
        try:
            files = os.listdir(jobDir + '/' + jobId)
            gsea_list = []
            for file in files:
                if 'gsea' in file and '.jpg' in file:
                    gsea_list.append(file)

            if (geneset == 'hallmark' and len(gsea_list) >= self.EXPECTED_HALLMARK_GSEA_OUTPUT_FILES) or (geneset == 'kegg' and len(gsea_list) >= self.EXPECTED_KEGG_GSEA_OUTPUT_FILES):
                return { 'err': False, 'message': None,  'plotList': gsea_list, 'percentComplete': 100 }
            
            else:
                percentComplete = 0
                if (geneset == 'hallmark'):
                    percentComplete = len(gsea_list) / self.EXPECTED_HALLMARK_GSEA_OUTPUT_FILES
                else:
                    percentComplete = len(gsea_list) / self.EXPECTED_KEGG_GSEA_OUTPUT_FILES
                
                return { 'err': True, 'message': 'Files for job ' + jobId + ' are not available', 'plotList': [], 'percentComplete': round(percentComplete, 2) * 100 }
        
        except FileNotFoundError as e:
            return { 'err': True, 'message': 'Files for job ' + jobId + ' are not available', 'plotList': [], 'percentComplete': 0 }

    def create_gsea_archive(self, jobDir, jobId):
        
        try:
            job_path = jobDir + '/' + jobId
            files = os.listdir(job_path)

            ZIPFILE_PATH = job_path + '/gsea_archive_' + jobId + '.zip'
            fileobj = io.BytesIO()
            with zipfile.ZipFile(ZIPFILE_PATH, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for file in files:
                    if '.jpg' in file or '.csv' in file:
                        zipf.write(job_path + '/' + file, os.path.basename(file))
            
            return { 'err': False, 'message': 'Archive compressed' }
        
        except Exception as e:
            print(e)
            return { 'err': True, 'message': 'Failed to compress archive' }

    def get_gsea_geneset_report(self, jobDir, jobId):

        try:
            job_path = jobDir + '/' + jobId + '/' + 'gseapy.gsea.gene_set.report.csv'
            df = pd.read_csv(job_path)
            jsn = []

            for i, row in df.iterrows():
                jsn.append({
                    'term': row['Term'],
                    'es': row['es'],
                    'nes': row['nes'],
                    'pval': row['pval'],
                    'fdr': row['fdr'],
                    'geneset_size': row['geneset_size'],
                    'matched_size': row['matched_size'],
                    'genes': row['genes'],
                    'ledge_genes': row['ledge_genes'],
                })
            
            return { 'err': False, 'message': None, 'report': jsn }

        except Exception as e:
            print(e)
            return { 'err': True, 'message': 'GSEA geneset report not available', 'report': None }