from datetime import datetime
from funcs_for_website import *


def main():
    dataset_name = "GSE41116"
    dataset_name = "GSE65858"
    dataset_name = "TCGA-HNSC"
    job_id = str(datetime.now().strftime('%Y%m%d_%H%M%S'))+"_test"

    box_or_violin = "violin"

    filtering_opt = {

    }

    filtering_opt = {
        "sex": ["male"], "age": {"max": 70, "min":40}, "hpv": ["neg"],
    }

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

    # GSEA TME
    print("#" * 30)
    print("gsea_tme")
    example_tme = "Macrophage M1|quanTIseq"
    result_plot_for_box = gsea_tme(job_id, dataset_name, example_tme, filter=filtering_opt)
    print(result_plot_for_box)

    # GSEA gene
    print("#" * 30)
    print("gsea_gene")
    example_gene = "TP53"
    result_plot_for_box = gsea_gene(job_id, dataset_name, example_gene, filter=filtering_opt)
    print(result_plot_for_box)

    # # GSEA clinical
    # print("#" * 30)
    # print("gsea_clinical")
    # example_clinical = "sex"
    # result_plot_for_box = gsea_clinical(job_id, dataset_name, example_clinical, filter=filtering_opt)
    # print(result_plot_for_box)

    #GSEA clinical New
    print("#" * 30)
    print("gsea_clinical")
    example_clinical = "smoker"
    gseaMultiClinicalFeature_input = {"pos":["yes", "former"], "neg":["no"]}
    # gseaMultiClinicalFeature_input = {"pos": ["yes"], "neg": ["no"]}
    # gseaMultiClinicalFeature_input = None
    result_plot_for_box = gsea_clinical(job_id, dataset_name, example_clinical, gseaMultiClinicalFeature_input, filter=filtering_opt)
    print(result_plot_for_box)

    # GSEA TME  With KEGG
    print("#" * 30)
    print("gsea_tme")
    example_tme = "Macrophage M1|quanTIseq"
    result_plot_for_box = gsea_tme(job_id, dataset_name, example_tme, filter=filtering_opt, geneset="kegg")
    print(result_plot_for_box)

    # GSEA gene With KEGG
    print("#" * 30)
    print("gsea_gene")
    example_gene = "TP53"
    result_plot_for_box = gsea_gene(job_id, dataset_name, example_gene, filter=filtering_opt, geneset="kegg")
    print(result_plot_for_box)

    # GSEA clinical  With KEGG
    print("#" * 30)
    print("gsea_clinical")
    example_clinical = "sex"
    result_plot_for_box = gsea_clinical(job_id, dataset_name, example_clinical, filter=filtering_opt, geneset="kegg")
    print(result_plot_for_box)


if __name__ == "__main__":
    #print(current_time())
    main()
