# import sys
from io import StringIO
import os
from datetime import datetime
import string, random
import pandas as pd
import numpy as np
import seaborn as sbn
import matplotlib.pyplot as plt
import math
import statistics

from .codes_for_website_support import draw_km_plot as kmp
from .codes_for_website_support import draw_corr_plot as corrp
from .codes_for_website_support import draw_plot as drawp

from .tp53_disruptive_classifier import tp53_disruptive as disruptive

import json
import gseapy as gp
from gseapy.plot import gseaplot

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
gmt_file_addr_gsea_kegg = env_config.get_config()['CORALE_GMT_FILE_ADDR_GSEA_KEGG']
output_base_folder = env_config.get_config()['JOBS_DIR']
input_base_folder = env_config.get_config()['CORALE_DATE_FILES']
temporary_km_csv = env_config.get_config()['CORALE_TEMPORARY_KM_CSV']

class Corale:

    #def __init__(self, dataset_name, input_file_addr=False, base_folder="/", file_output_folder="/output/", gmt_file_addr_for_gsea = gmt_file_addr_gsea):
    def __init__(self, dataset_name, job_id = None, filter = None, input_file_addr=False, input_base_folder=input_base_folder, output_base_folder=output_base_folder, geneset="hallmark"):

        if job_id is None:
            job_id = str(datetime.now().strftime('%Y%m%d_%H%M%S'))

        self.job_id = job_id
        self.input_file = input_file_addr
        if input_file_addr:
            self.input_file = input_file_addr
        else:
            full_file_path = os.path.join(input_base_folder, dataset_name + "_corale.txt")
            self.input_file = full_file_path
        self.output_folder = os.path.join(output_base_folder, job_id)
        if not os.path.exists(self.output_folder):
            os.makedirs(self.output_folder)
        if geneset == "kegg":
            self.gmt_file_addr_for_gsea = gmt_file_addr_gsea_kegg
        else:
            self.gmt_file_addr_for_gsea = gmt_file_addr_gsea

        self.data_all = self.read_corale_file(self.input_file)  # dict: each following sections in dataframe

        info_dic = self.get_basic_info_of_the_dataset(self.data_all) # dictionary: including all the following info
        self.os_avail = info_dic["os_available"] # bool: OS analysis available?
        self.gene_list = info_dic["gene_list"] # list: available genes in expression dataset
        self.clinical_feat_list = info_dic["clinical_feat_list"] # list: clinical feature list
        self.sample_size = info_dic["sample_size"] # int: number of samples in the clinical dataset

        # data filtering
        if filter is not None:
            self.apply_filtering(filter)

        self.data_meta = self.data_all["meta"]                  # dataframe
        self.data_clinical = self.data_all["clinical"]          # dataframe
        self.data_expression = self.data_all["expression"]      # dataframe
        self.data_tme = self.data_all["tme"]                    # dataframe
        self.data_mutation = self.data_all["mutation"]          # dataframe
        self.data_mutation_class, self.data_mutation_truncate = self.mutation_to_class() # dataframe
        self.mutation_available = False
        if not self.data_mutation_class.empty:
            self.mutation_available = True

    def apply_filtering(self, filtering_opt_input):

        def age_cat_to_int(age_cat_str:str):
            if age_cat_str is None:
                return None
            else:
                try:
                    return int(age_cat_str.split("-")[0])
                except ValueError as e:
                    return int(float(age_cat_str.split("-")[0]))

        def select_subset_in_section(section_name):
            # expression
            selected_data_part = self.data_all[section_name]
            selected_data_part = selected_data_part[selected_data_part.index.isin(selected_samples)]
            return selected_data_part

        #filtering opt example:
        selected_clinical = self.data_all["clinical"]

        for k in filtering_opt_input:
            if k in self.clinical_feat_list:

                if k == "age":
                    v_max = filtering_opt_input[k]["max"]
                    v_min = filtering_opt_input[k]["min"]

                    if type(v_max) == str:
                        v_max = int(v_max)
                    if type(v_min) == str:
                        v_min = int(v_min)

                    selected_clinical = selected_clinical[selected_clinical["age"].apply(age_cat_to_int)>=v_min]

                    selected_clinical = selected_clinical[selected_clinical["age"].apply(age_cat_to_int)<=v_max]

                else:

                    selected_clinical = selected_clinical.loc[selected_clinical[k].isin(filtering_opt_input[k])]

            else:
                print("Warning! %s is not included in this dataset." % k)


        selected_samples = selected_clinical.index
        self.data_all["clinical"] = selected_clinical

        self.data_all["expression"] = select_subset_in_section("expression")
        self.data_all["tme"] = select_subset_in_section("tme")
        self.data_all["mutation"] = select_subset_in_section("mutation")



    def read_corale_file(self, corale_file_addr):  # Read corale file and get five different dataframes ( "meta", "clinical", "expression", "tme", "mutation" ) in the dictionary
        with open(corale_file_addr, 'r') as file:
            data = file.read()

        data_dic = {}
        for f in field_list:
            temp_df = self.get_section_as_df(f, data)
            if f == "clinical":
                temp_df.replace({'NaN': None, 'Na': None, 'NA': None, "na": None, "nan": None}, inplace=True)
                temp_df["os_status"] = temp_df["death"]
                temp_df["os_status"].replace({"dead":1, "alive":0})

            data_dic[f] = temp_df

        return data_dic


    def get_basic_info_of_the_dataset(self, data_dic):
        # Extract basic information of the dataset and put them into a dictionary

        # meta_feat_name = field_list[0]
        # clinical_feat_name = field_list[1]
        # exp_feat_name = field_list[2]
        # tme_feat_name = field_list[3]
        # mutation_feat_name = field_list[4]

        info_dic = {}
        for f in field_list:
            if (type(data_dic[f]) != pd.DataFrame):

                info_dic[f] = False
            else:
                info_dic[f] = True

        # get sample size
        sample_size = data_dic["clinical"].shape[0]
        info_dic["sample_size"] = sample_size

        # Check OS analysis is available
        os_availability = False
        os_available_num = self.get_non_none_val_count(["os_status", "os_month"], data_dic["clinical"])
        if os_available_num >= os_minimum_num:
            os_availability = True
        info_dic["os_available"] = os_availability

        # get clinical feature list
        info_dic["clinical_feat_list"] = []
        temp_clinical_feat_list = data_dic["clinical"].columns.tolist()

        #info_dic["clinical_feat_list"] = data_dic["clinical"].columns.tolist()
        for col in temp_clinical_feat_list:
            unique_val_list = data_dic["clinical"][col].unique().tolist()
            if not (len(unique_val_list)<2 and unique_val_list[0] is None):
                info_dic["clinical_feat_list"].append(col)

                info_dic[col] = self.get_non_none_val_count(col, data_dic["clinical"])

        # get gene list
        info_dic["gene_list"] = data_dic["expression"].columns.tolist()

        return info_dic

    def mutation_to_class(self):
        # the input mutation data is HGVS forms (e.g., "p.V600E"). Change them to two different matrix with different classes (mutation_pos_class_data:MUTATION/WT, mutation_truncate_class_data:TRUNCATE/MISSENSE/WT)

        mutation_data = self.data_mutation
        mutation_pos_class_data = pd.DataFrame()
        mutation_truncate_class_data = pd.DataFrame()

        if not mutation_data.empty:

            mutation_list = mutation_data.columns.tolist()
            for m in mutation_list:
                if m.endswith("_mut"):
                    gene_name = m.replace("_mut", "")
                    mutation_pos_class_data[gene_name] = self.get_mutation_class(gene_name)
                    mutation_truncate_class_data[gene_name] = self.get_mutation_class(gene_name, truncate = True)


        return mutation_pos_class_data, mutation_truncate_class_data


    def get_mutation_class(self, gene_name, truncate = False):
        # For the input gene name, decide "high" and "low" group by finding median value as the cut point
        # this label will be used for KMplot

        gene_name_in_mut_data = gene_name+"_mut"

        mutation_data = self.data_mutation

        mutation_list = mutation_data.columns.tolist()

        if not (gene_name_in_mut_data in mutation_list):
            print("Error: %s is not in the mutation dataset" % gene_name)
            return None

        disr = disruptive()

        temp_data = pd.DataFrame()
        temp_data[gene_name] = mutation_data[gene_name_in_mut_data]
        temp_data["class"] = ""
        temp_data["mutation"] = ""

        for i in range((temp_data[gene_name].size)):
            mut_class = "WT"
            is_mut = "WT"
            truncate_flag = False
            missense_flag = False
            mut_str_raw = temp_data[gene_name][i]
            if (mut_str_raw != np.nan) and (type(mut_str_raw) == str):
                for s in mut_str_raw.split(","):
                    s = s.strip()
                    if disr.is_truncate(s):
                        truncate_flag = True
                    if disr.is_missense(s):
                        missense_flag = True
            else:
                mut_class = "WT"
                is_mut = "WT"

            if missense_flag:
                mut_class = "missense"
            if truncate_flag:
                mut_class = "truncate"
            if missense_flag or truncate_flag:
                is_mut = "MUTATION"
            temp_data["class"][i] = mut_class
            temp_data["mutation"][i] = is_mut

        if truncate:
            return temp_data["class"]
        else:
            return temp_data["mutation"]


    def get_gsea_results_for_gene(self, gene_name_highlow_x, expression_data_highlow_x = None, expression_data = None, gsea_results_number_limit=300, output_folder_for_gsea = False):
        # get highlow of gene expression and separate the samples into two groups, and use it as clinical feature.
        # TME can be used for this function (e.g., CD4-CIBERSORT High/Low)

        if expression_data_highlow_x is None:
            expression_data_highlow_x = self.data_expression
        if expression_data is None:
            expression_data = self.data_expression
        highlow_for_gene = self.get_highlow_for_exp(gene_name_highlow_x, exp_df = expression_data_highlow_x)

        return_info = self.get_gsea_results_for_clinical_feat(gene_name_highlow_x, clinical_data = highlow_for_gene, expression_data = expression_data,
                                                              gsea_results_number_limit=gsea_results_number_limit, output_folder_for_gsea = output_folder_for_gsea)
        return return_info


    def get_gsea_results_for_clinical_feat(self, clinical_feat_name, gseaMultiClinicalFeature:dict = None, clinical_data=False,
                                           expression_data = None, gmt_file=False, gsea_results_number_limit=300, output_folder_for_gsea = False):
        # get gsea result. separate samples into groups using the input clinical feature
        # gsea results are saved in a dictionary. all the output files are going to be saved in the 'base_folder'.
        # The  relevant gene set results are saved in the image ("output_file_name")
        # this function returns A LIST OF DICTIONARIES
        # Because if the clinical feature has more than 2 class, it generates multiple GSEA results.
        # For example, clinical feat has (A, B, C) class, it generates (A, not-A), (B, not-B), (C, not-C) results



        if gseaMultiClinicalFeature is None or (len(gseaMultiClinicalFeature['pos']) == 0 and len(gseaMultiClinicalFeature['neg']) == 0):
            # default to current way of grouping and use clinical_name parameter
            prior_feats = ["pos", "high", "yes", "male", "primary", "case"]


            return_info_list = []
            multiple_gsea = False # this switch will be turned on when there are more than 2 classes in the clinical feature

            if (type(clinical_data) != pd.DataFrame) and (type(clinical_data) != pd.Series):
                clinical_data = self.data_clinical
            if type(expression_data) != pd.DataFrame:
                expression_data = self.data_expression
            if not gmt_file:
                gmt_file = self.gmt_file_addr_for_gsea
            if output_folder_for_gsea == False:
                output_folder_for_gsea = self.output_folder

            clinical_data = self.df_remove_nan(clinical_data, clinical_feat_name)

            sample_list_exp = expression_data.index.tolist()
            sample_list_clinical = clinical_data.index.tolist()

            sample_list_clinical_pos = []
            sample_list_clinical_neg = []
            for s in sample_list_clinical:

                if (type(clinical_data) == pd.DataFrame) and (clinical_data[clinical_feat_name][s] in prior_feats):
                #if clinical_data[clinical_feat_name][s] in prior_feats:
                    sample_list_clinical_pos.append(s)
                    #cls_list_new_pos.append("pos")
                if (type(clinical_data) != pd.DataFrame) and (clinical_data[s] in prior_feats):
                    sample_list_clinical_pos.append(s)
                else:
                    sample_list_clinical_neg.append(s)
                    #cls_list_new_neg.append("neg")
            sample_list_clinical_ordered = sample_list_clinical_pos + sample_list_clinical_neg

            sample_list_overlapped = []
            for se in sample_list_clinical_ordered:
                if se in sample_list_exp:
                    sample_list_overlapped.append(se)

            cls_list = []
            exp_t = expression_data.T.astype("float")
            exp_t = exp_t[sample_list_overlapped]

            for s in sample_list_overlapped:
                if type(clinical_data) == pd.DataFrame:
                    current_f = clinical_data[clinical_feat_name][s]
                    cls_list.append(current_f)
                else:
                    current_f = clinical_data[s]
                    cls_list.append(current_f)

            cls_list_unique = list(set(cls_list))

            if len(cls_list_unique) > 2:
                #multiple_gsea = True
                print("ERROR! Too many classes in this data")
                return_info_list = [{"error": True}]
                return return_info_list
            elif len(cls_list_unique) < 2:
                print("ERROR! Only one class in this data")
                return_info_list = [{"error":True}]
                return return_info_list
            else:
                return_info = self.run_gsea(exp_t, gmt_file, cls_list, output_folder_for_gsea, gsea_results_number_limit)
                return_info_list.append(return_info)

                return_info_list[0]["gseaMultiClinicalFeature"] = gseaMultiClinicalFeature
                return return_info_list
        else:
            # Newly added selective clinical feat GSEA

            pos_feats = gseaMultiClinicalFeature["pos"]
            neg_feats = gseaMultiClinicalFeature["neg"]
            pos_feats_str = "&".join(map(str, pos_feats))
            neg_feats_str = "&".join(map(str, neg_feats))
            print("pos: %s" % pos_feats)
            print("neg: %s" % neg_feats)

            return_info_list = []
            multiple_gsea = False  # this switch will be turned on when there are more than 2 classes in the clinical feature

            if (type(clinical_data) != pd.DataFrame) and (type(clinical_data) != pd.Series):
                clinical_data = self.data_clinical
            if type(expression_data) != pd.DataFrame:
                expression_data = self.data_expression
            if not gmt_file:
                gmt_file = self.gmt_file_addr_for_gsea
            if output_folder_for_gsea == False:
                output_folder_for_gsea = self.output_folder

            print(clinical_data[clinical_feat_name])
            clinical_data = self.df_remove_nan(clinical_data, clinical_feat_name)

            sample_list_exp = expression_data.index.tolist()
            sample_list_clinical = clinical_data.index.tolist()
            sample_list_clinical_pos = []
            sample_list_clinical_neg = []
            cls_list_new_pos = []
            cls_list_new_neg = []
            for s in sample_list_clinical:
                if clinical_data[clinical_feat_name][s] in pos_feats:
                    sample_list_clinical_pos.append(s)
                    cls_list_new_pos.append("pos")
                elif clinical_data[clinical_feat_name][s] in neg_feats:
                    sample_list_clinical_neg.append(s)
                    cls_list_new_neg.append("neg")
            sample_list_clinical_ordered = sample_list_clinical_pos + sample_list_clinical_neg
            cls_list_new = cls_list_new_pos + cls_list_new_neg

            sample_list_overlapped = []

            for se in sample_list_clinical_ordered:
                if se in sample_list_exp:
                    sample_list_overlapped.append(se)

            cls_list = []
            exp_t = expression_data.T.astype("float")
            exp_t = exp_t[sample_list_overlapped]
            for s in sample_list_overlapped:
                if type(clinical_data) == pd.DataFrame:
                    current_f = clinical_data[clinical_feat_name][s]
                    if current_f in pos_feats:
                        cls_list.append("pos")
                    else:
                        cls_list.append("neg")
                else:
                    current_f = clinical_data[s]
                    if current_f in pos_feats:
                        cls_list.append("pos")
                    else:
                        cls_list.append("neg")
            print(cls_list)

            cls_list_unique = list(set(cls_list))

            if len(cls_list_unique) > 2:
                #multiple_gsea = Tru
                print("ERROR! Too many classes in this data")
                return_info_list = [{"error": True}]
                return return_info_list

            elif len(cls_list_unique) < 2:
                print("ERROR! Only one class in this data")
                return_info_list = [{"error": True}]
                return return_info_list

            return_info = self.run_gsea(exp_t, gmt_file, cls_list, output_folder_for_gsea,
                                        gsea_results_number_limit)
            return_info_list.append(return_info)

            return_info_list[0]["gseaMultiClinicalFeature"] = gseaMultiClinicalFeature
            return_info_list[0]["pos_class"] = pos_feats #pos_feats_str
            return_info_list[0]["neg_class"] = neg_feats #neg_feats_str

            return return_info_list




    def run_gsea(self, exp_t, gmt_file, cls_list, output_folder_for_gsea, gsea_results_number_limit, ):
        return_info = {}
        return_info["gs_list"] = []
        return_info["gs_fig_file_addr_list"] = []

        return_info["unique_class_list"] = list(set(cls_list))
        cls_list_unique=list(set(cls_list))

        return_info["pos_class"] = cls_list[0]
        if cls_list_unique[0] == return_info["pos_class"]:
            return_info["neg_class"] = cls_list_unique[1]
        else:
            return_info["neg_class"] = cls_list_unique[0]

        gs_res = gp.gsea(data=exp_t,
                         gene_sets=gmt_file,
                         cls=cls_list,
                         outdir=output_folder_for_gsea,
                         format="jpg",
                         min_size=5,
                         permutation_num=500,
                         )

        gseapy_result = gs_res.results

        terms = gs_res.res2d.index

        result_counter = 0
        for t in terms:
            if result_counter < gsea_results_number_limit:
                #output_file_name = self.generate_file_name(tag="gsea")
                output_file_name = self.generate_file_name_fixed(t)

                plt_gsea = gseaplot(gs_res.ranking, term=t, **gs_res.results[t], ofname=output_file_name)
                return_info["gs_list"].append(t)
                return_info["gs_fig_file_addr_list"].append(output_file_name)
                result_counter += 1

        return_info["raw_result_from_gseapy"] = gseapy_result
        return return_info



    def plot_corr_plot_for_two_genes(self, gene_y, gene_x, output_file_name=None, dataset_y = None, dataset_x = None):
        if output_file_name is None:
            output_file_name = self.generate_file_name(tag="corr")

        if dataset_y is None:
            dataset_y = self.data_expression
        if dataset_x is None:
            dataset_x = self.data_expression

        #returned_info = corrp(gene_x, gene_y, output_file_name, self.data_expression, self.data_expression)
        returned_info = corrp(gene_x, gene_y, output_file_name, dataset_x, dataset_y)
        return returned_info


    def plot_box_plot_for_gene_level_and_clinical_feat(self, gene_name_y, clinical_feat_name_x, expression_data_y=False,
                                                       clinical_data_x=False, output_file_name=False, plot_kind = "box"):
        # get gene name and clinical feature as input
        # using clinical feat, separate samples to groups, and see the gene expression difference

        if not output_file_name:
            output_file_name = self.generate_file_name()
        if (type(clinical_data_x) != pd.DataFrame) and (type(clinical_data_x) != pd.Series):
            clinical_data_x = self.data_clinical
        if (type(expression_data_y) != pd.DataFrame) and (type(expression_data_y) != pd.Series):
            expression_data_y = self.data_expression

        returned_info = drawp(gene_name_y, clinical_feat_name_x, expression_data_y, clinical_data_x,
                                output_file_name=output_file_name, plot_kind = plot_kind)
        return returned_info


    def plot_box_plot_for_tme_and_clinical_feat(self, clinical_feat_name_x, tme_feat="", tme_method="",
                                                clinical_data_x=False, tme_data_y=False, plot_kind = "box"):
        # plotting violin plot for clinical feat and tme level

        return_info = {}

        if (type(clinical_data_x) != pd.DataFrame) and (type(clinical_data_x) != pd.Series):
            clinical_data_x = self.data_clinical
        if (type(tme_data_y) != pd.DataFrame) and (type(tme_data_y) != pd.Series):
            tme_data_y = self.data_tme

        tme_feat_list = self.data_tme.columns.tolist()
        tme_feat_list_selected = []
        for t in tme_feat_list:
            if (tme_method == "") or (t.endswith(tme_method)):
                if  (tme_feat == "") or (tme_feat in t):
                    tme_feat_list_selected.append(t)

        for ts in tme_feat_list_selected:

            # get gene name and clinical feature as input
            # using clinical feat, separate samples to groups, and see the gene expression difference

            output_file_name = self.generate_file_name(tag = "tme")


            return_info[ts] = drawp(ts, clinical_feat_name_x, tme_data_y, clinical_data_x,
                                    output_file_name=output_file_name, plot_kind = plot_kind)
        return return_info

    def plot_box_plot_for_gene_level_and_gene_highlow(self, gene_name_y, gene_name_highlow_x, expression_data_y=False,
                                                      expression_data_highlow_x=False, output_file_name=False, plot_kind = "box"):
        # get gene name and clinical feature as input
        # using clinical feat, separate samples to groups, and see the gene expression difference

        if output_file_name is False:
            output_file_name = self.generate_file_name()

        if expression_data_y is False:
            expression_data_y = self.data_expression

        if expression_data_highlow_x is False:
            expression_data_highlow_x = self.data_expression

        highlow_for_gene = self.get_highlow_for_exp(gene_name_highlow_x, expression_data_highlow_x)
        returned_info = self.plot_box_plot_for_gene_level_and_clinical_feat(gene_name_y, gene_name_highlow_x,
                                                                            expression_data_y, highlow_for_gene,
                                                                            output_file_name=output_file_name, plot_kind = plot_kind)

        return returned_info

    def plot_box_plot_for_tme_and_gene_highlow(self, gene_name_highlow_x, tme_feat="", tme_method="",
                                               expression_data_highlow_x=False, plot_kind = "box"):
        # for input gene high/low group, see the difference between tme

        if not expression_data_highlow_x:
            expression_data_highlow_x = self.data_expression

        highlow_for_gene = self.get_highlow_for_exp(gene_name_highlow_x, expression_data_highlow_x)
        returned_info = self.plot_box_plot_for_tme_and_clinical_feat(gene_name_highlow_x, tme_feat = tme_feat, tme_method=tme_method, clinical_data_x=highlow_for_gene, plot_kind = plot_kind)

        return returned_info

    def plot_box_plot_for_gene_level_and_mutation(self, gene_name_y, mutation_x, expression_data_y=False,
                                                  mutation_data_x=False, output_file_name=False, plot_kind = "box"):
        # get gene name and clinical feature as input
        # using clinical feat, separate samples to groups, and see the gene expression difference

        if output_file_name is False:
            output_file_name = self.generate_file_name()

        if expression_data_y is False:
            expression_data_y = self.data_expression

        if mutation_data_x is False:
            mutation_data_x = self.data_mutation


        #highlow_for_gene = self.get_highlow_for_exp(mutation_x, mutation_data_x)
        highlow_for_gene = self.get_mutation_class(mutation_x)
        returned_info = self.plot_box_plot_for_gene_level_and_clinical_feat(gene_name_y, mutation_x,
                                                                            expression_data_y, highlow_for_gene,
                                                                            output_file_name=output_file_name, plot_kind = plot_kind)

        return returned_info


    def plot_km_for_gene(self, gene_name, clinical_data=False, expression_data=False, output_file_name=False):
        # calling "plot_km_for_clinical_feat" with gene high/low class.
        if output_file_name is False:
            output_file_name = self.generate_file_name()
        if clinical_data is False:
            clinical_data = self.data_clinical
        if expression_data is False:
            expression_data = self.data_expression

        temp_data = clinical_data[["os_status", "os_month"]]
        temp_data = temp_data.dropna()
        highlow_for_gene = self.get_highlow_for_exp(gene_name, expression_data)
        temp_data.loc[:, "group"] = highlow_for_gene
        processed_data_json = temp_data.to_json()

        returned_info = kmp(temp_data, "group", output_file_name, tag=gene_name, )
        returned_info["processed_data"] = processed_data_json
        returned_info["title"] = gene_name
        return returned_info

    def plot_km_for_mutation(self, mutated_gene_name, clinical_data=False, expression_data=False, output_file_name=False):
        # calling "plot_km_for_clinical_feat" with gene high/low class.
        if output_file_name is False:
            output_file_name = self.generate_file_name()
        if clinical_data is False:
            clinical_data = self.data_clinical
        if expression_data is False:
            expression_data = self.data_expression

        temp_data = clinical_data[["os_status", "os_month"]]
        temp_data = temp_data.dropna()
        highlow_for_gene = self.get_mutation_class(mutated_gene_name)
        temp_data.loc[:, "group"] = highlow_for_gene
        processed_data_json = temp_data.to_json()

        returned_info = kmp(temp_data, "group", output_file_name, tag=mutated_gene_name, )
        returned_info["processed_data"] = processed_data_json
        returned_info["title"] = mutated_gene_name
        return returned_info

    def plot_km_for_clinical_feat(self, feat_name, clinical_data=False, output_file_name=False):
        # Plotting KM-plot using the feature name in the clinical data. it will return basic information about the analysis and the plot image file full address.
        # not only the clinical data but also the mutation class data or gene highlow data can be used as input.

        if not output_file_name:
            output_file_name = self.generate_file_name()
        if not clinical_data:
            clinical_data = self.data_clinical

        temp_data = clinical_data[["os_status", "os_month", feat_name]]
        temp_data = temp_data.dropna()
        temp_data.rename(columns={feat_name: "group"})
        processed_data_json = temp_data.to_json()
        temp_data.to_csv(temporary_km_csv)
        returned_info = dict(kmp(temp_data, feat_name, output_file_name, tag=feat_name, ))
        try:
            feat_list = returned_info['feat_list']
            for feature in feat_list:
                returned_info[feature]['median'] = str(returned_info[feature]['median'])
        except Exception as e:
            print(e)
        returned_info["processed_data"] = processed_data_json
        returned_info["title"] = feat_name
        return returned_info

    def get_heatmap_results(self, gene_list=None, clinical_feature=None, tme_feature=None, clusterMetric='correlation', clusterLinkage='average', showOneOrAllTme=None):

        TME_ONE_OR_ALL_VALUES = { 'one': 'tmeOne', 'all': 'tmeAll' }
        MIN_SCALE = -2
        MAX_SCALE = 2

        def scale(value):
            oldMin = 0
            oldMax = 1
            newMin = 0
            newMax = 255
            oldRange = oldMax - oldMin
            newRange = newMax - newMin
            return int((((value - oldMin) * newRange) / oldRange) + newMin)

        def convert_decimal_rgb_to_integer(rgb):
            red = rgb[0]
            green = rgb[1]
            blue = rgb[2]
            red = scale(red)
            green = scale(green)
            blue = scale(blue)
            return (red, green, blue)

        if gene_list:
            genes_in_data_expression = []
            genes_not_in_data_expression = []
            passthru = [ genes_in_data_expression.append(gene) if gene in self.data_expression.columns else genes_not_in_data_expression.append(gene) for gene in gene_list ]
            df = self.data_expression[genes_in_data_expression]
        
            if tme_feature and showOneOrAllTme == TME_ONE_OR_ALL_VALUES['one']:
                ary = self.data_tme[tme_feature]
                df2 = pd.DataFrame(ary)
                df = pd.merge(df, df2, left_index=True, right_index=True)
            
            if showOneOrAllTme == TME_ONE_OR_ALL_VALUES['all']:
                df = pd.merge(df, self.data_tme, left_index=True, right_index=True)

        if not gene_list:

            genes_not_in_data_expression = None

            if tme_feature and showOneOrAllTme == TME_ONE_OR_ALL_VALUES['one']:
                ary = self.data_tme[tme_feature]
                df = pd.DataFrame(ary)
            
            if showOneOrAllTme == TME_ONE_OR_ALL_VALUES['all']:
                df = pd.DataFrame(self.data_tme)

        headers = []
        passthru = [ headers.append(header.replace('CIBERSORTx', 'CIBERSORT')) for header in list(df) ]
        df.columns = headers

        # z-transform
        dff = pd.DataFrame()
        for col in range(0, len(df.columns)):
            tary = []
            for i, row in enumerate(df.iterrows()):
                tary.append(df[df.columns[col]][i])

            mean = statistics.mean(tary)
            stdev = statistics.stdev(tary)
            tdf = (pd.DataFrame(tary) - mean) / stdev
            dff[df.columns[col]] = tdf[tdf.columns[0]].tolist()

        index = df.index
        df = dff
        df.index = index

        q = df > MAX_SCALE
        df[q] = MAX_SCALE
        q = df < MIN_SCALE
        df[q] = MIN_SCALE

        df.index.name = 'sampleid'

        if clinical_feature:
            clinical_feature_ary = []
            for index, row in df.iterrows():
                try:
                    if math.isnan(self.data_clinical.loc[index][clinical_feature]):
                        clinical_feature_ary.append('unknown')
                except Exception as e:
                    if self.data_clinical.loc[index][clinical_feature] == None or self.data_clinical.loc[index][clinical_feature] == '' or self.data_clinical.loc[index][clinical_feature] == 'NA' or self.data_clinical.loc[index][clinical_feature] == 'na':
                        clinical_feature_ary.append('unknown')
                    else:
                        clinical_feature_ary.append(self.data_clinical.loc[index][clinical_feature])

            df.insert(len(df.columns), clinical_feature, clinical_feature_ary, True)

            palette = sbn.husl_palette(len(np.unique(df[clinical_feature])), s=.45)
            color_dict = dict(zip(np.unique(df[clinical_feature]), palette))
            feature_df = pd.DataFrame({clinical_feature: df[clinical_feature]})
            col_colors = feature_df[clinical_feature].map(color_dict)

            feature_color_tuple = []
            passthru = [ feature_color_tuple.append((df[clinical_feature][i], row)) for i, row in enumerate(col_colors) ]
            feature_color_tuple = list(set(feature_color_tuple))

            feature_color_map = {'feature': clinical_feature, 'legend': {}}
            for feature_color in feature_color_tuple:
                feature_color_map['legend'][feature_color[0]] = '#%02x%02x%02x' % convert_decimal_rgb_to_integer(feature_color[1])


        LINEWIDTHS = 0.75

        if len(df.columns) > 100:
            y = 50
        elif len(df.columns) > 80:
            y = 40
        elif len(df.columns) > 60:
            y = 30
        else:
            y=20

        if len(df) > 100:
            x = 50
        elif len(df) > 80:
            x = 40
        elif len(df) > 60:
            x = 30
        else:
            x = 20

        FIGSIZE = (x,y)

        if clinical_feature:
            n_cols = len(df.columns) - 1
            g = sbn.clustermap(df.iloc[:,0:n_cols].astype(float).T, 
                    #center=0, 
                    cmap="vlag",
                    method=clusterLinkage,
                    metric=clusterMetric,
                    col_colors=col_colors,
                    #z_score=0,
                    dendrogram_ratio=(.1, .2),
                    cbar_pos=(2.02, .32, .03, .2),
                    linewidths=LINEWIDTHS, 
                    figsize=FIGSIZE)
            #### uncomment if you want to remove y-axis dendrogram ####
            #g.ax_row_dendrogram.remove()
            ###########################################################
        else:
            n_cols = len(df.columns)
            g = sbn.clustermap(df.iloc[:,0:n_cols].astype(float).T, 
                    #center=0, 
                    cmap="vlag",
                    method=clusterLinkage,
                    metric=clusterMetric,
                    #z_score=0,
                    dendrogram_ratio=(.1, .2),
                    cbar_pos=(2.02, .32, .03, .2),
                    linewidths=LINEWIDTHS, 
                    figsize=FIGSIZE)
            #### uncomment if you want to remove y-axis dendrogram ####
            #g.ax_row_dendrogram.remove()
            ###########################################################

        filename = 'clustermap_' + self.job_id + '.jpg'
        plt.savefig(output_base_folder + '/' + self.job_id + '/' + filename, dpi=150)

        if clinical_feature:
            feature_color_map['filename'] = filename
            feature_color_map['jobId'] = self.job_id 
            feature_color_map['noClinicalFeature'] = False
            return feature_color_map, genes_not_in_data_expression
        else:
            return { 'noClinicalFeature': True, 'filename': filename, 'jobId': self.job_id }, genes_not_in_data_expression

    def get_non_none_val_count(self, feat_name, clinical_data: pd.DataFrame):
        # val_count = clinical_data[feat_name].value_counts()
        try:
            if type(feat_name) == str:
                all_nonval_count = clinical_data[feat_name].count()
            elif type(feat_name) == list:

                selected_data = clinical_data[
                    clinical_data[feat_name].notna().all(1)]
                # metadata_cancer_survival_sub = clinical_data[metadata_cancer_survival[target_feat].notna()]
                all_nonval_count = selected_data.shape[0]

            return all_nonval_count
        except KeyError as e:
            return 0

    def get_section_as_df(self, field_name, corale_file_str: str):
        start_str = "#%s_data_start" % field_name
        end_str = "#%s_data_end" % field_name

        cant_find = False
        if start_str not in corale_file_str:
            print("%s is not in the file" % start_str)
            cant_find = True
        if end_str not in corale_file_str:
            print("%s is not in the file" % end_str)
        if cant_find:
            return pd.DataFrame()

        start_index = corale_file_str.index(start_str) + len(start_str) + 1
        end_index = corale_file_str.index(end_str) - 1
        extracted_section = corale_file_str[start_index:end_index]
        extracted_section = extracted_section.replace("\n!", "\n")
        if extracted_section.strip() == "":
            return None
        strio_extracted_section = StringIO(extracted_section)
        section_df = pd.read_csv(strio_extracted_section, sep="\t", index_col=0).T

        return section_df

    def get_highlow_for_exp(self, gene_name, exp_df = None, median_without_zero=False, zero_vs_nonzero=False, use_mean_instead_of_median = False):
        # For the input gene name, decide "high" and "low" group by finding median value as the cut point
        # this label will be used for KMplot or will be used as same as clinical feature

        if type(exp_df) != pd.DataFrame:
            exp_df = self.data_expression

        col_list = exp_df.columns.tolist()
        if not (gene_name in col_list):
            print("Error: %s is not in the expression dataset" % gene_name)
            return None

        if exp_df[gene_name].max() < almost_zero:
            print("Error: %s has zero values in all the samples" % gene_name)
            return None

        if len(exp_df[gene_name]) == 0:
            print("Error: %s has not enough samples" % gene_name)
            return None

        temp_exp = pd.DataFrame()
        if use_mean_instead_of_median:
            temp_exp[gene_name] = exp_df[gene_name]
            median_exp = temp_exp[gene_name].mean() # acutally this is mean, not median
        else:
            if median_without_zero:
                temp_exp[gene_name] = exp_df.loc[exp_df[gene_name] > almost_zero]
                median_exp = temp_exp[gene_name].median()

            elif zero_vs_nonzero:
                temp_exp[gene_name] = exp_df[gene_name]
                median_exp = almost_zero
            else:
                temp_exp[gene_name] = exp_df[gene_name]
                median_exp = temp_exp[gene_name].median()

            if median_exp == 0.0:
                # same as 'median_without_zero'
                print("Median value is Zero: Finding a new median value in non-zero values")
                temp_exp[gene_name] = exp_df.loc[exp_df[gene_name] > almost_zero]
                median_exp = temp_exp[gene_name].median()

        temp_exp[gene_name].astype("float")

        if median_without_zero:
            temp_exp.loc[temp_exp[gene_name] <= almost_zero, gene_name + "_"] = None
            temp_exp.loc[
                ((temp_exp[gene_name] <= median_exp) & (temp_exp[gene_name] > almost_zero)), gene_name + "_"] = "low"
        else:
            temp_exp.loc[(temp_exp[gene_name] <= median_exp), gene_name + "_"] = "low"

        temp_exp.loc[temp_exp[gene_name] > median_exp, gene_name + "_"] = "high"

        return temp_exp[gene_name + "_"]

    def generate_file_name_fixed(self, filename_fixed, ext="jpg", base_folder_input=False, tag=False):
        # generate file name mostly for plot image files with full address. If base_folder_input is not specified, it will use the default "self.file_output_folder"
        if not base_folder_input:
            base_folder_input = self.output_folder
        current_time = str(datetime.now().strftime('%Y%m%d_%H%M%S'))
        letters = string.ascii_lowercase
        #random_str = ''.join(random.choice(letters) for i in range(rand_str_len))
        if not tag:
            file_name = filename_fixed  + ".gsea." + ext
        else:
            file_name = tag+"_"+filename_fixed  + ".gsea." + ext
        full_file_path = os.path.join(base_folder_input, file_name)
        return full_file_path

    def generate_file_name(self, ext="jpg", base_folder_input=False, rand_str_len=4, tag=False):
        # generate file name mostly for plot image files with full address. If base_folder_input is not specified, it will use the default "self.file_output_folder"
        if not base_folder_input:
            base_folder_input = self.output_folder
        current_time = str(datetime.now().strftime('%Y%m%d_%H%M%S'))
        letters = string.ascii_lowercase
        random_str = ''.join(random.choice(letters) for i in range(rand_str_len))
        if not tag:
            file_name = current_time + "_" + random_str + "." + ext
        else:
            file_name = tag+"_"+current_time + "_" + random_str + "." + ext
        full_file_path = os.path.join(base_folder_input, file_name)
        return full_file_path

    def sub_df_selection(self, meta_data, feat_field_name, selected_feat):
        meta_data_temp = meta_data.dropna(subset=[feat_field_name])
        meta_sub = meta_data_temp.groupby(feat_field_name).get_group(selected_feat)
        meta_sub_final = meta_sub.dropna(subset=[feat_field_name])

        return meta_sub_final

    def df_remove_nan(self, meta_data, feat_field_name):
        if type(meta_data) == pd.DataFrame:
            meta_data_temp = meta_data.dropna(subset=[feat_field_name])
        else:
            meta_data_temp = meta_data.dropna()
        #meta_sub = meta_data_temp.groupby(feat_field_name).get_group(selected_feat)
        #meta_sub_final = meta_sub.dropna(subset=[feat_field_name])

        return meta_data_temp
