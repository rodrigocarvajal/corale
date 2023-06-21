import os
import datetime
import sys
sys.path.append('..')
from corale import funcs_for_website as ffw
from pymongo import MongoClient
from services.ConfigReader import ConfigReader
from services.DirectoryService import DirectoryService


class SubmitJobService:

    NULLVALS = [None, '',]

    def __init__(self, params, jobsDir):
        self.params = params
        self.jobsDir = jobsDir
        self.jobId = self._create_jobId()
        self.configReader = ConfigReader()
        self.config = self.configReader.get_config()

    def _create_jobId(self):
        today = datetime.datetime.now()
        jobId = today.strftime("%Y%m%d%H%M%S")
        #os.makedirs(self.jobsDir + '/' + jobId)
        return jobId

    def _format_filters(self):
        if self.params['filters']:
            return self.params['filters']
        return None

    def _create_db_connection(self):
        client = MongoClient('mongodb://' + self.config['MONGO_USER'] + ':' + self.config['MONGO_PASS'] + '@' + self.config['MONGO_HOST'] + ':' + self.config['MONGO_PORT'] + '/?authSource=' + self.config['MONGO_AUTHDB'])
        return client[self.config['MONGO_DB']]
    
    def _get_tme_list(self):
        db = self._create_db_connection()
        doc = db['tme_data'].find_one({ 'cohort': self.params['dataset'] }, { '_id': 0, 'cohort': 0, 'sampleid': 0 })
        tme_list = []

        for cell_line in doc:
            for method in doc[cell_line]:
                tme_list.append(cell_line + '|' + method)
        
        return tme_list

    def set_jobId(self, job_id):
        self.jobId = job_id

    def create_plots_and_data(self):

        filters = self._format_filters()
        tme_list = self._get_tme_list()
        pos_class = None
        missingGenes = None

        if self.params['plot'] == 'survival':

            if self.params['groupingGene'] not in self.NULLVALS and (self.params['groupingMutation'] in self.NULLVALS and self.params['grouping'] in self.NULLVALS and self.params['groupingTme'] in self.NULLVALS):
                jsn = ffw.plot_km_for_gene(self.jobId, self.params['dataset'], self.params['groupingGene'], filters)
            
            elif self.params['groupingTme'] not in self.NULLVALS and (self.params['groupingMutation'] in self.NULLVALS and self.params['grouping'] in self.NULLVALS and self.params['groupingGene'] in self.NULLVALS):
                jsn = ffw.plot_km_for_tme(self.jobId, self.params['dataset'], self.params['groupingTme'], filters)
            
            elif self.params['grouping'] not in self.NULLVALS and (self.params['groupingMutation'] in self.NULLVALS and self.params['groupingTme'] in self.NULLVALS and self.params['groupingGene'] in self.NULLVALS):
                jsn = ffw.plot_km_for_clinical(self.jobId, self.params['dataset'], self.params['grouping'], filters)
            
            elif self.params['groupingMutation'] not in self.NULLVALS and (self.params['grouping'] in self.NULLVALS and self.params['groupingTme'] in self.NULLVALS and self.params['groupingGene'] in self.NULLVALS):
                jsn = ffw.plot_km_for_mutation(self.jobId, self.params['dataset'], self.params['groupingMutation'], filters)
            
            else:
                return { 'err': True, 'message': 'Invalid KM plot parameters provided' }

        
        elif self.params['plot'] == 'boxplot' or self.params['plot'] == 'violin':

            plot_type = 'box'
            #if self.params['plot'] == 'violin':
            #    plot_type = 'violin'

            if self.params['targets'] in tme_list: # TME

                if self.params['groupingGene'] not in self.NULLVALS and (self.params['groupingMutation'] in self.NULLVALS and self.params['grouping'] in self.NULLVALS and self.params['groupingTme'] in self.NULLVALS):
                    jsn = ffw.plot_box_for_tme_target_and_gene_grouping(self.jobId, self.params['dataset'], self.params['targets'], self.params['groupingGene'], filters, plot_type)
                
                elif self.params['groupingTme'] not in self.NULLVALS and (self.params['groupingMutation'] in self.NULLVALS and self.params['grouping'] in self.NULLVALS and self.params['groupingGene'] in self.NULLVALS):
                    jsn = ffw.plot_box_for_tme_target_and_tme_grouping(self.jobId, self.params['dataset'], self.params['targets'], self.params['groupingTme'], filters, plot_type)
                
                elif self.params['grouping'] not in self.NULLVALS and (self.params['groupingMutation'] in self.NULLVALS and self.params['groupingTme'] in self.NULLVALS and self.params['groupingGene'] in self.NULLVALS):
                    jsn = ffw.plot_box_for_tme_target_and_clinical_feat_grouping(self.jobId, self.params['dataset'], self.params['targets'], self.params['grouping'], filters, plot_type)
                
                elif self.params['groupingMutation'] not in self.NULLVALS and (self.params['grouping'] in self.NULLVALS and self.params['groupingTme'] in self.NULLVALS and self.params['groupingGene'] in self.NULLVALS):
                    jsn = ffw.plot_box_for_tme_target_and_mutated_gene_grouping(self.jobId, self.params['dataset'], self.params['targets'], self.params['groupingMutation'], filters, plot_type)

                else:
                    return { 'err': True, 'message': 'Invalid boxplot TME target parameters provided' }

            else: # gene target

                if self.params['groupingGene'] not in self.NULLVALS and (self.params['groupingMutation'] in self.NULLVALS and self.params['grouping'] in self.NULLVALS and self.params['groupingTme'] in self.NULLVALS):
                    jsn = ffw.plot_box_for_gene_and_gene(self.jobId, self.params['dataset'], self.params['targets'], self.params['groupingGene'], filters, plot_type)
                
                elif self.params['groupingTme'] not in self.NULLVALS and (self.params['groupingMutation'] in self.NULLVALS and self.params['grouping'] in self.NULLVALS and self.params['groupingGene'] in self.NULLVALS):
                    jsn = ffw.plot_box_for_gene_target_and_tme_grouping(self.jobId, self.params['dataset'], self.params['targets'], self.params['groupingTme'], filters, plot_type)
                
                elif self.params['grouping'] not in self.NULLVALS and (self.params['groupingMutation'] in self.NULLVALS and self.params['groupingTme'] in self.NULLVALS and self.params['groupingGene'] in self.NULLVALS):
                    jsn = ffw.plot_box_for_gene_target_and_clinical_feat_grouping(self.jobId, self.params['dataset'], self.params['targets'], self.params['grouping'], filters, plot_type)
                
                elif self.params['groupingMutation'] not in self.NULLVALS and (self.params['grouping'] in self.NULLVALS and self.params['groupingTme'] in self.NULLVALS and self.params['groupingGene'] in self.NULLVALS):
                    jsn = ffw.plot_box_for_gene_target_and_mutated_gene_grouping(self.jobId, self.params['dataset'], self.params['targets'], self.params['groupingMutation'], filters, plot_type)

                else:
                    return { 'err': True, 'message': 'Invalid or missing boxplot grouping or target feature selection' }

        elif self.params['plot'] == 'correlation':

            if self.params['targets'] in tme_list: # TME
                
                if self.params['groupingGene'] not in self.NULLVALS and self.params['targets'] and self.params['groupingTme'] in self.NULLVALS:
                    jsn = ffw.plot_corr_tme_y_gene_x(self.jobId, self.params['dataset'], self.params['targets'], self.params['groupingGene'], filters)
                
                elif self.params['groupingTme'] not in self.NULLVALS and self.params['targets'] and self.params['groupingGene'] in self.NULLVALS:
                    jsn = ffw.plot_corr_tme_y_tme_x(self.jobId, self.params['dataset'], self.params['targets'], self.params['groupingTme'], filters)
                
                else:
                    return { 'err': True, 'message': 'Invalid correlation TME target parameters provided' }

            else: # gene target

                if self.params['groupingGene'] not in self.NULLVALS and self.params['targets'] and self.params['groupingTme'] in self.NULLVALS:
                    jsn = ffw.plot_corr_gene_y_gene_x(self.jobId, self.params['dataset'], self.params['targets'], self.params['groupingGene'], filters)

                elif self.params['groupingTme'] not in self.NULLVALS and self.params['targets'] and self.params['groupingGene'] in self.NULLVALS:
                    jsn = ffw.plot_corr_gene_y_tme_x(self.jobId, self.params['dataset'], self.params['targets'], self.params['groupingTme'], filters)

                else:
                    return { 'err': True, 'message': 'Invalid correlation gene target parameters provided.  Only Gene-Gene, Gene-TME or TME-TME corelations are allowed' }
            
        elif self.params['plot'] == 'gsea':

            if self.params['groupingGene'] not in self.NULLVALS and (self.params['grouping'] in self.NULLVALS and self.params['groupingTme'] in self.NULLVALS):
                jsn, pos_class = ffw.gsea_gene(self.jobId, self.params['dataset'], self.params['groupingGene'], self.params['gseaGeneset'], filters)
            
            elif self.params['groupingTme'] not in self.NULLVALS and (self.params['grouping'] in self.NULLVALS and self.params['groupingGene'] in self.NULLVALS):
                jsn, pos_class = ffw.gsea_tme(self.jobId, self.params['dataset'], self.params['groupingTme'], self.params['gseaGeneset'], filters)
            
            elif self.params['grouping'] not in self.NULLVALS and (self.params['groupingTme'] in self.NULLVALS and self.params['groupingGene'] in self.NULLVALS):
                jsn = ffw.gsea_clinical(self.jobId, self.params['dataset'], self.params['grouping'], self.params['gseaMultiClinicalFeature'], self.params['gseaGeneset'], filters)

            else:
                return { 'err': True, 'message': 'Invalid GSEA parameters provided' }

            db = self._create_db_connection()
            IGNORE_UNKNOWN_ERROR = False

            try:
                db['job_parameters'].update({ 'jobId': self.jobId }, { '$set': { 'pos_class': jsn[0]['pos_class'], 'neg_class': jsn[0]['neg_class'] }})
            except KeyError as e:
                errorMsg = None
                IGNORE_UNKNOWN_ERROR = True
                if e.args[0] == 'pos_class':
                    errorMsg = 'ERROR: insufficient data to create Positive Class.  Please choose a different dataset'
                else:
                    errorMsg = 'ERROR: insufficient data to create Negative Class.  Please choose a different dataset'

                db['job_parameters'].update({ 'jobId': self.jobId }, { '$set': { 'error': True, 'errorMsg': errorMsg }})

            if not IGNORE_UNKNOWN_ERROR and 'error' in jsn[0] and jsn[0]['error']:
                errorMsg = 'Unkown GSEA error. Please try again or select a new dataset'
                db['job_parameters'].update({ 'jobId': self.jobId }, { '$set': { 'error': True, 'errorMsg': errorMsg }})
                return { 'err': True, 'message': errorMsg }

            directoryService = DirectoryService()
            directoryService.create_gsea_archive(self.config['JOBS_DIR'], self.jobId)

        elif self.params['plot'] == 'cluster':
            if self.params['geneExprOrTme'] == 'gene' and len(self.params['geneList']) > 0:
                jsn, missingGenes = ffw.heatmap_gene_expression(self.jobId, self.params['dataset'], self.params['filters'], self.params['geneList'], self.params['grouping'], self.params['selectedClusterMetric'], self.params['selectedClusterLinkage'])

            elif self.params['geneExprOrTme'] == 'tme':
                geneList = None
                try:
                    if len(self.params['geneList']) > 0:
                        geneList = self.params['geneList']
                except Exception as e:
                    pass

                jsn, missingGenes = ffw.heatmap_tme(self.jobId, self.params['dataset'], self.params['filters'], geneList, self.params['grouping'], self.params['groupingTme'], self.params['selectedClusterMetric'], self.params['selectedClusterLinkage'], self.params['showOneOrAllTme'])

            else:
                return { 'err': True, 'message': 'Invalide cluster parameters provided' }

        else:
            return { 'err': True, 'message': 'Invalid plot type chosen' }

        if self.params['plot'] == 'gsea':
            jsn = None
        
        if jsn and 'high' in jsn and str(jsn['high']['median']) == 'inf':
            jsn['high']['median'] = None
        
        if jsn and 'low' in jsn and str(jsn['low']['median']) == 'inf':
            jsn['low']['median'] = None

        return { 'err': False, 'results': jsn, 'missingGenesCluster': missingGenes }
    