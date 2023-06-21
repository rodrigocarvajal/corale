
import json
from .corale import Corale

import sys
sys.path.append('..')
from services.ConfigReader import ConfigReader

env_config = ConfigReader()

with open(env_config.get_config()['CORALE_JSON_CONFIG'], 'r') as openfile:
    # Reading from json file
    config = json.load(openfile)

field_list = config["field_list"]
almost_zero = config["almost_zero"]
os_minimum_num = config["os_minimum_num"]
gmt_file_addr_gsea = env_config.get_config()['CORALE_GMT_FILE_ADDR_GSEA']
output_base_folder = env_config.get_config()['JOBS_DIR']
input_base_folder = env_config.get_config()['CORALE_DATE_FILES']


def main():
    dataset_name = "GSE41116"
    dataset_name = "GSE65858"
    dataset_name = "TCGA-HNSC"
    job_id = str(datetime.now().strftime('%Y%m%d_%H%M%S'))+"_test"

    box_or_violin = "violin"

    filtering_opt = {

    }

    # filtering_opt = {
    #     "sex": "male", "age": {"max": 70, "min":40}, "hpv": "neg",
    # }

    # KM Plot with a gene (group feature)
    print("#" * 30)
    print("plot_km_for_gene")
    example_gene = "TP53"
    result_plot_for_gene = plot_km_for_gene(job_id, dataset_name, example_gene, filter = filtering_opt)
    print(result_plot_for_gene)

    # KM plot with a clinical feature (group feature)
    print("#" * 30)
    print("plot_km_for_feat")
    example_feat = "alcohol"
    example_feat = "sex"
    result_plot_for_feat = plot_km_for_clinical(job_id, dataset_name, example_feat)
    print(result_plot_for_feat)

    # KM plot with TME (group feature)
    print("#" * 30)
    print("plot_km_for_tme")
    example_feat = "Macrophage M1|quanTIseq"
    result_plot_for_feat = plot_km_for_tme(job_id, dataset_name, example_feat, filter = filtering_opt)
    print(result_plot_for_feat)

    # KM plot with mutation (group feature)
    print("#" * 30)
    print("plot_km_for_mutation")
    example_mutation_gene = "TP53"
    result_plot_for_feat = plot_km_for_mutation(job_id, dataset_name, example_mutation_gene)
    print(result_plot_for_feat)

    ################################################

    # correlation plots

    # Correlation plot with gene and gene
    print("#" * 30)
    print("plot_corr_gene_y_gene_x")
    example_gene_y = "BRAF"
    example_gene_x = "TP53"
    result_plot_for_feat = plot_corr_gene_y_gene_x(job_id, dataset_name, example_gene_y, example_gene_x)
    print(result_plot_for_feat)

    # Correlation plot with gene and gene
    print("#" * 30)
    print("plot_corr_gene_y_tme_x")
    example_gene_y = "BRAF"
    example_tme_x = "Macrophage M1|quanTIseq"
    result_plot_for_feat = plot_corr_gene_y_tme_x(job_id, dataset_name, example_gene_y, example_tme_x)
    print(result_plot_for_feat)

    # Correlation plot with gene and gene
    print("#" * 30)
    print("plot_corr_tme_y_gene_x")
    example_tme_y = "Macrophage M1|quanTIseq"
    example_gene_x = "TP53"
    result_plot_for_feat = plot_corr_tme_y_gene_x(job_id, dataset_name, example_tme_y, example_gene_x)
    print(result_plot_for_feat)

    # Correlation plot with gene and gene
    print("#" * 30)
    print("plot_corr_tme_y_tme_x")
    example_tme_y = "Macrophage M1|quanTIseq"
    example_tme_x = "Monocyte|MCPcounter"
    result_plot_for_feat = plot_corr_tme_y_tme_x(job_id, dataset_name, example_tme_y, example_tme_x)
    print(result_plot_for_feat)



    ################################################

    # box plot with two genes
    print("#" * 30)
    print("plot_box_for_gene_and_gene")
    example_target_gene = "TP53"
    example_grouping_gene = "BRAF"
    result_plot_for_box = plot_box_for_gene_and_gene(job_id, dataset_name, example_target_gene, example_grouping_gene, filter = filtering_opt, plot_kind = box_or_violin)
    print(result_plot_for_box)

    # box plot with a target gene and tme grouping
    print("#" * 30)
    print("plot_box_for_gene_target_and_tme_grouping")
    example_target_gene = "TP53"
    example_grouping_tme = "Macrophage M1|quanTIseq"
    result_plot_for_box = plot_box_for_gene_target_and_tme_grouping(job_id, dataset_name, example_target_gene, example_grouping_tme, filter = filtering_opt, plot_kind = box_or_violin)
    print(result_plot_for_box)

    # box plot with a target tme and gene grouping
    print("#" * 30)
    print("plot_box_for_tme_target_and_gene_grouping")
    example_target_tme = "Macrophage M1|quanTIseq"
    example_grouping_gene = "TP53"
    result_plot_for_box = plot_box_for_tme_target_and_gene_grouping(job_id, dataset_name, example_target_tme, example_grouping_gene, filter = filtering_opt, plot_kind = box_or_violin)
    print(result_plot_for_box)

    # box plot with a target tme and tme grouping
    print("#" * 30)
    print("plot_box_for_tme_target_and_tme_grouping")
    example_target_tme = "Macrophage M1|quanTIseq"
    example_grouping_tme = "Monocyte|MCPcounter"
    result_plot_for_box = plot_box_for_tme_target_and_tme_grouping(job_id, dataset_name, example_target_tme, example_grouping_tme, filter=None, plot_kind = box_or_violin)
    print(result_plot_for_box)



    # box plot with a target gene and clinical feat grouping
    print("#" * 30)
    print("plot_box_for_gene_target_and_clinical_feat_grouping")
    example_clinical_feat = "sex"
    example_target_gene = "TP53"
    result_plot_for_box = plot_box_for_gene_target_and_clinical_feat_grouping(job_id, dataset_name, example_target_gene, example_clinical_feat, filter = filtering_opt, plot_kind = box_or_violin)
    print(result_plot_for_box)


    # box plot with a target tme and clinical feat grouping
    print("#" * 30)
    print("plot_box_for_tme_target_and_clinical_feat_grouping")
    example_clinical_feat = "sex"
    example_target_tme = "Macrophage M1|quanTIseq"
    result_plot_for_box = plot_box_for_tme_target_and_clinical_feat_grouping(job_id, dataset_name, example_target_tme, example_clinical_feat, filter = filtering_opt, plot_kind = box_or_violin)
    print(result_plot_for_box)

    # box plot with a target gene and mutated gene grouping
    print("#" * 30)
    print("plot_box_for_gene_target_and_mutated_gene_grouping")
    example_target_gene = "BRAF"
    example_mutation_gene = "TP53"
    result_plot_for_box = plot_box_for_gene_target_and_mutated_gene_grouping(job_id, dataset_name, example_target_gene, example_mutation_gene, filter = filtering_opt, plot_kind = box_or_violin)
    print(result_plot_for_box)

    # box plot with a target tme and mutated gene grouping
    print("#" * 30)
    print("plot_box_for_tme_target_and_mutated_gene_grouping")
    example_target_tme = "Macrophage M1|quanTIseq"
    example_mutation_gene = "TP53"
    result_plot_for_box = plot_box_for_tme_target_and_mutated_gene_grouping(job_id, dataset_name, example_target_tme, example_mutation_gene, filter=filtering_opt, plot_kind = box_or_violin)
    print(result_plot_for_box)


    ##############################

    #GSEA gene
    print("#" * 30)
    print("gsea_gene")
    example_gene = "TP53"
    result_plot_for_box = gsea_gene(job_id, dataset_name, example_gene, filter=filtering_opt)
    print(result_plot_for_box)

    #GSEA clinical
    print("#" * 30)
    print("gsea_clinical")
    example_clinical = "sex"
    result_plot_for_box = gsea_clinical(job_id, dataset_name, example_clinical, filter=filtering_opt)
    print(result_plot_for_box)

    #GSEA TME
    print("#" * 30)
    print("gsea_tme")
    example_tme = "Macrophage M1|quanTIseq"
    result_plot_for_box = gsea_tme(job_id, dataset_name, example_tme, filter=filtering_opt)
    print(result_plot_for_box)


def _create_corale_instance(dataset_name, job_id = None, filter = None, output_base_folder = output_base_folder, geneset = None):
    return Corale(dataset_name, job_id = job_id, filter = filter, geneset=geneset)

# KM Plot with a gene input
def plot_km_for_gene(job_id, dataset_name, gene, filter = None):
    corale = _create_corale_instance(dataset_name, job_id = job_id, filter = filter)
    returned_km_info = corale.plot_km_for_gene(gene)
    return returned_km_info

# KM Plot with a TME input
def plot_km_for_tme(job_id, dataset_name, tme, filter = None):
    corale = _create_corale_instance(dataset_name, job_id = job_id, filter = filter)
    returned_km_info = corale.plot_km_for_gene(tme, expression_data = corale.data_tme)
    return returned_km_info

# KM Plot with a clinical feature input
def plot_km_for_clinical(job_id, dataset_name, clinical_feature, filter = None):
    corale = _create_corale_instance(dataset_name, job_id = job_id, filter = filter)
    returned_km_info = corale.plot_km_for_clinical_feat(clinical_feature)
    return returned_km_info

# KM Plot with a mutation input
def plot_km_for_mutation(job_id, dataset_name, mutation_name, filter = None):
    corale = _create_corale_instance(dataset_name, job_id = job_id, filter = filter)
    returned_km_info = corale.plot_km_for_mutation(mutation_name)
    return returned_km_info

##################
#box Plots (plot_kind="violin": draw violin plots instead of box plots)

# box Plot with two genes (target feat = gene_name_target, group feat = gene_name_grouping)
def plot_box_for_gene_and_gene(job_id, dataset_name, gene_name_target, gene_name_grouping, filter = None, plot_kind = "box"):
    corale = _create_corale_instance(dataset_name, job_id=job_id, filter=filter)
    returned_box_info = corale.plot_box_plot_for_gene_level_and_gene_highlow(gene_name_y= gene_name_target, gene_name_highlow_x= gene_name_grouping, plot_kind = plot_kind)
    return returned_box_info

# box Plot with a gene (target) and a tme feat (grouping) (target feat = gene_name_target, group feat = tme_name_grouping)
def plot_box_for_gene_target_and_tme_grouping(job_id, dataset_name, gene_name_target, tme_name_grouping, filter = None, plot_kind = "box"):
    corale = _create_corale_instance(dataset_name, job_id=job_id, filter=filter)
    returned_box_info = corale.plot_box_plot_for_gene_level_and_gene_highlow(gene_name_y= gene_name_target, gene_name_highlow_x= tme_name_grouping, expression_data_highlow_x=corale.data_tme, plot_kind = plot_kind)
    return returned_box_info

# box Plot with a tme (target) and a gene (grouping) (target feat = tme_name_target, group feat = gene_name_grouping)
def plot_box_for_tme_target_and_gene_grouping(job_id, dataset_name, tme_name_target, gene_name_grouping, filter = None, plot_kind = "box"):
    corale = _create_corale_instance(dataset_name, job_id=job_id, filter=filter)
    returned_box_info = corale.plot_box_plot_for_gene_level_and_gene_highlow(gene_name_y= tme_name_target, gene_name_highlow_x= gene_name_grouping, expression_data_y=corale.data_tme, plot_kind = plot_kind)
    return returned_box_info

# box Plot with a tme (target) and a tme feat (grouping) (target feat = tme_name_target, group feat = tme_name_grouping)
def plot_box_for_tme_target_and_tme_grouping(job_id, dataset_name, tme_name_target, tme_name_grouping, filter = None, plot_kind = "box"):
    corale = _create_corale_instance(dataset_name, job_id=job_id, filter=filter)
    returned_box_info = corale.plot_box_plot_for_gene_level_and_gene_highlow(gene_name_y= tme_name_target, gene_name_highlow_x= tme_name_grouping, expression_data_highlow_x=corale.data_tme, expression_data_y= corale.data_tme, plot_kind = plot_kind)
    return returned_box_info

# box Plot with a gene (target) and a clinical feat (grouping) (target feat = gene_name_target, group feat = clinical_feat_grouping)
def plot_box_for_gene_target_and_clinical_feat_grouping(job_id, dataset_name, gene_name_target, clinical_feat_grouping, filter = None, plot_kind = "box"):
    corale = _create_corale_instance(dataset_name, job_id=job_id, filter=filter)
    returned_box_info = corale.plot_box_plot_for_gene_level_and_clinical_feat(gene_name_target, clinical_feat_grouping, plot_kind = plot_kind)
    return returned_box_info

# box Plot with a tme (target) and a clinical feat (grouping) (target feat = tme_name_target, group feat = gene_name_grouping)
def plot_box_for_tme_target_and_clinical_feat_grouping(job_id, dataset_name, tme_name_target, clinical_feat_grouping, filter = None, plot_kind = "box"):
    corale = _create_corale_instance(dataset_name, job_id=job_id, filter=filter)
    returned_box_info = corale.plot_box_plot_for_gene_level_and_clinical_feat(tme_name_target, clinical_feat_grouping, expression_data_y = corale.data_tme, plot_kind = plot_kind)
    return returned_box_info

# box Plot with a gene and a mutated gene (target feat = gene_name_target, group feat = mutated_gene_name_grouping)
def plot_box_for_gene_target_and_mutated_gene_grouping(job_id, dataset_name, gene_name_target, mutated_gene_name_grouping, filter = None, plot_kind = "box"):
    corale = _create_corale_instance(dataset_name, job_id=job_id, filter=filter)
    returned_box_info = corale.plot_box_plot_for_gene_level_and_mutation(gene_name_target, mutated_gene_name_grouping, plot_kind = plot_kind)
    return returned_box_info

# box Plot with a tme and a mutated gene (target feat = tme_name_target, group feat = mutated_gene_name_grouping)
def plot_box_for_tme_target_and_mutated_gene_grouping(job_id, dataset_name, tme_name_target, mutated_gene_name_grouping, filter = None, plot_kind = "box"):
    corale = _create_corale_instance(dataset_name, job_id=job_id, filter=filter)
    returned_box_info = corale.plot_box_plot_for_gene_level_and_mutation(tme_name_target, mutated_gene_name_grouping, expression_data_y= corale.data_tme, plot_kind = plot_kind)
    return returned_box_info

####################
# Correlation plots

def plot_corr_gene_y_gene_x(job_id, dataset_name, gene_name_y, gene_name_x, filter = None):
    corale = _create_corale_instance(dataset_name, job_id=job_id, filter=filter)
    returned_corr_info = corale.plot_corr_plot_for_two_genes(gene_name_y, gene_name_x)
    return returned_corr_info

def plot_corr_gene_y_tme_x(job_id, dataset_name, gene_name_y, tme_name_x, filter = None):
    corale = _create_corale_instance(dataset_name, job_id=job_id, filter=filter)
    returned_corr_info = corale.plot_corr_plot_for_two_genes(gene_name_y, tme_name_x, dataset_x = corale.data_tme)
    return returned_corr_info

def plot_corr_tme_y_gene_x(job_id, dataset_name, tme_name_y, gene_name_x, filter = None):
    corale = _create_corale_instance(dataset_name, job_id=job_id, filter=filter)
    returned_corr_info = corale.plot_corr_plot_for_two_genes(tme_name_y, gene_name_x, dataset_y = corale.data_tme)
    return returned_corr_info

def plot_corr_tme_y_tme_x(job_id, dataset_name, tme_name_y, tme_name_x, filter = None):
    corale = _create_corale_instance(dataset_name, job_id=job_id, filter=filter)
    returned_corr_info = corale.plot_corr_plot_for_two_genes(tme_name_y, tme_name_x, dataset_x = corale.data_tme, dataset_y = corale.data_tme)
    return returned_corr_info


#####################
# GSEA

def gsea_gene(job_id, dataset_name, gene_name, geneset="hallmark", filter = None):
    corale = _create_corale_instance(dataset_name, job_id=job_id, filter=filter, geneset=geneset)
    gsea_results = corale.get_gsea_results_for_gene(gene_name)
    return gsea_results, gsea_results[0]['pos_class']

def gsea_tme(job_id, dataset_name, tme_name, geneset = "hallmark", filter = None):
    corale = _create_corale_instance(dataset_name, job_id=job_id, filter=filter, geneset=geneset)
    gsea_results = corale.get_gsea_results_for_gene(tme_name, expression_data_highlow_x= corale.data_tme)
    return gsea_results, gsea_results[0]['pos_class']

def gsea_clinical(job_id, dataset_name, clinical_name, gseaMultiClinicalFeature:dict = None, geneset = "hallmark", filter = None):
    corale = _create_corale_instance(dataset_name, job_id=job_id, filter=filter, geneset=geneset)
    gsea_results = corale.get_gsea_results_for_clinical_feat(clinical_name, gseaMultiClinicalFeature)
    return gsea_results


#####################
# HEATMAP

def heatmap_gene_expression(job_id, dataset_name, filter, gene_list, clinical_feature, clusterMetric, clusterLinkage):
    corale = _create_corale_instance(dataset_name, job_id=job_id, filter=filter)
    heatmap_results, missingGenes = corale.get_heatmap_results(gene_list=gene_list, clinical_feature=clinical_feature, clusterMetric=clusterMetric, clusterLinkage=clusterLinkage, showOneOrAllTme=None)
    return heatmap_results, missingGenes

def heatmap_tme(job_id, dataset_name, filter, gene_list, clinical_feature, tme_feature, clusterMetric, clusterLinkage, showOneOrAllTme):
    corale = _create_corale_instance(dataset_name, job_id=job_id, filter=filter)
    heatmap_results, missingGenes = corale.get_heatmap_results(gene_list, clinical_feature, tme_feature, clusterMetric, clusterLinkage, showOneOrAllTme)
    return heatmap_results, missingGenes
