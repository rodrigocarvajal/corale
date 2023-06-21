import matplotlib
matplotlib.rcParams['font.family'] = 'arial'
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import seaborn as sns
from lifelines import KaplanMeierFitter
from lifelines.statistics import multivariate_logrank_test
from lifelines.utils import median_survival_times
from lifelines.statistics import logrank_test

from scipy import stats

def main():
    print("")

def draw_corr_plot(gene_x, gene_y, output_file_name, data_x, data_y):
    return_info = {}
    return_info["error"] = False
    data_series_x = pd.Series()
    data_series_y = pd.Series()
    if type(data_x) == pd.DataFrame:
        data_series_x = data_x[gene_x]
    elif type(data_x) == pd.Series:
        data_series_x = data_x
    if type(data_y) == pd.DataFrame:
        data_series_y = data_y[gene_y]
    elif type(data_y) == pd.Series:
        data_series_y = data_y

    data_here = pd.DataFrame()
    data_here[gene_x] = data_series_x
    data_here[gene_y] = data_series_y
    data_here.astype(float)

    data_return = pd.DataFrame()
    data_return["x_axis"] = data_series_x
    data_return["y_axis"] = data_series_y
    data_return.astype(float)

    plt = sns.lmplot(x=gene_x, y=gene_y, data=data_here, fit_reg=True)

    plt.savefig(output_file_name, dpi=600)
    corr_df = data_here.corr(method="pearson")
    corr = corr_df[gene_x][gene_y]

    slope, intercept, r_value, p_value, std_err = stats.linregress(data_here[gene_x], data_here[gene_y])

    return_info["file_addr"] = output_file_name
    return_info["corr"] = corr
    return_info["x_label"] = gene_x
    return_info["y_label"] = gene_y
    return_info["processed_data"] = data_return.to_json()
    return_info["slope"] = slope
    return_info["intercept"] = intercept
    return_info["pval"] = p_value
    return_info["std_err"] = std_err
    return_info["rval"] = r_value
    return return_info

def draw_plot(y_field_name, x_field_name, data_expression, data_clinical, output_file_name, plot_kind = "box",
              tag="", pval_threshold=1.0, with_n=True, order=None, palette=None, bottom_zero=True
              ):
    if plot_kind == "box":
        return_info = draw_boxplot(y_field_name, x_field_name, data_expression, data_clinical, output_file_name)
    else:
        return_info = draw_violin_plot(y_field_name, x_field_name, data_expression, data_clinical, output_file_name, tag=tag, pval_threshold=pval_threshold, with_n=with_n, order=order, palette=palette, bottom_zero=bottom_zero)

    return return_info



def draw_violin_plot(y_field_name, x_field_name, data_tme, data_clinical, output_file_name, tag="", pval_threshold=1.0, with_n=True, order=None,
                     palette=None, bottom_zero=True):

    return_info = {}
    return_info["error"] = False
    return_info["group"] = x_field_name
    return_info["y_label"] = y_field_name
    return_info["feat_list"] = []
    data_here=pd.DataFrame()
    data_here["y_axis"] = data_tme[y_field_name]

    # for violin plot
    if type(data_clinical) == pd.DataFrame:

        data_here["group"] = data_clinical[x_field_name]
    else:

        data_here["group"] = data_clinical


    if order == None:
        if type(data_clinical) == pd.DataFrame:
            feat_list = data_clinical[x_field_name].unique().tolist()
        else:
            feat_list = data_clinical.unique().tolist()
        feat_list_clean = [x for x in feat_list if str(x) != 'nan']
        order = sorted(feat_list_clean)

        # print("order: %s" % order)
        if "WT" in order and "disruptive" in order and "non-disruptive" in order:
            order = ["WT", "disruptive", "non-disruptive"]
            palette = {"WT": "#9b59b6", "disruptive": '#95a5a6', "non-disruptive": "#e74c3c"}
        elif "POS" in order and "NEG" in order:
            order = ["POS", "NEG"]
            palette = {"POS": "#9b59b6", "NEG": '#95a5a6'}
        elif "YES" in order and "NO" in order:
            order = ["YES", "NO"]
            palette = {"YES": "#9b59b6", "NO": '#95a5a6'}
        elif "truncate" in order and "missense" in order and "WT" in order:
            order = ["WT", "missense", "truncate"]
            palette = {"WT": "#9b59b6", "truncate": '#95a5a6', "missense": "#e74c3c"}
        elif "truncate" in order and "missense" in order:
            order = ["missense", "truncate"]
            palette = {"truncate": '#95a5a6', "missense": "#e74c3c"}

        elif "NEVER" in order and "FORMER" in order:
            order = ["NEVER", "FORMER", "CURRENT"]
            palette = {"NEVER": "#9b59b6", "FORMER": '#95a5a6', "CURRENT": "#e74c3c"}
        return_info["feat_list"] = order

    kw_results = kw_test("group", "y_axis", data_here, data_here)
    p_val = kw_results["pval"]#float(return_sum.split("\t")[1].strip())
    return_info.update(kw_results)

    pval_str = "p-val=%5f" % (p_val)

    if p_val < pval_threshold:
        fig, axes = plt.subplots(figsize=(20, 10))

        axes.tick_params(labelsize=14)


        sns.violinplot(x="group", y="y_axis", data=data_here, ax=axes, scale="count", sort=False,
                       palette=palette, order=order)
        if tag == "" or tag == "- ":
            axes.set_title(("%s / %s, %s" % (x_field_name, y_field_name, pval_str)), fontsize=20)
        else:
            axes.set_title(("%s, %s" % (tag, pval_str)), fontsize=20)

        axes.yaxis.grid(True)
        axes.set_xlabel(x_field_name, fontsize=20)
        axes.set_ylabel(y_field_name, fontsize=20)
        if bottom_zero:
            axes.set_ylim(bottom=0)

        plt.xticks(rotation=90)

        plt.savefig(output_file_name, dpi=600)
    return_info["file_addr"] = output_file_name
    return_info["processed_data"] = data_here.to_json()
    return return_info


def draw_boxplot(target_gene_name, class_name, data_expression, data_clinical, output_file_name):
    return_info = {}
    return_info["error"] = False
    return_info["x_label"] = class_name
    return_info["y_label"] = target_gene_name

    data_here = pd.DataFrame()
    if type(data_clinical) == pd.DataFrame:
        data_here["group"] = data_clinical[class_name]
    else:
        data_here["group"] = data_clinical

    data_here["y_axis"] = data_expression[target_gene_name]

    data_here = data_here.dropna(subset=['group'])

    index_list = data_here.index.values
    df_for_plot = pd.DataFrame(index=index_list)

    unique_value_list = data_here['group'].unique().tolist()
    unique_value_list.sort()

    actual_value_list = []
    for c in unique_value_list:
        if c != "nan":

            data_clinical_sub = data_here.groupby('group').get_group(c)

            df_for_plot[c] = data_clinical_sub['y_axis']

            actual_value_list.append(c)
    df_for_plot = df_for_plot.astype(float)

    fig, ax1 = plt.subplots(dpi=600)

    class_name_for_fig = class_name
    if class_name.endswith("_"):
        class_name_for_fig = class_name[:-1]

    ax1.set_ylabel(target_gene_name, weight='bold')
    ax1.set_xlabel(class_name_for_fig, weight='bold')
    ax = df_for_plot.boxplot(ax=ax1, fontsize=10, figsize=(10, 7), grid=False)

    fig.savefig(output_file_name, dpi=600)

    return_info["file_addr"] = output_file_name

    returned_stat_info = kw_test(class_name, target_gene_name, data_here, data_here)
    return_info.update(returned_stat_info)
    return_info["processed_data"] = data_here.to_json()
    return return_info


def kw_test(x_field_name, y_field_name, data_meta, new_data_tme):
    return_info = {}
    return_info["feat_list"] = []

    return_str = ""
    return_sum = ""
    feat_val_list = data_meta['group'].unique().tolist()

    feat_val_list = [i for i in feat_val_list if i]

    new_feat_val_list = []
    for i in feat_val_list:
        if str(i) != "nan":
            new_feat_val_list.append(i)
    feat_val_list = new_feat_val_list

    if "nan" in feat_val_list:
        feat_val_list.remove("nan")

    feat_val_list.sort()

    cs_val_list = []
    for feat_i in feat_val_list:
        tme_selected = new_data_tme[new_data_tme['group'] == feat_i]['y_axis']

        np_cs = tme_selected[tme_selected.notna()].to_numpy()
        cs_val_list.append(np_cs)

        return_str = return_str + str(feat_i) + ":" + str(len(np_cs)) + ":" + str(np.median(np_cs)) + ", "
        return_sum = return_sum + str(feat_i) + "\t" + str(len(np_cs)) + "\t" + str(np.median(np_cs)) + "\t"

        return_info["feat_list"].append(str(feat_i))
        return_info[str(feat_i)] = {}
        return_info[str(feat_i)]["size"] = len(np_cs)
        return_info[str(feat_i)]["median"] = np.median(np_cs)

    pval = 1.0
    if len(cs_val_list) > 1:
        try:
            # Kruskal-Wallis H-test
            from scipy.stats import kruskal
            stat, p = kruskal(*cs_val_list)
            p_str = "%.5f" % p

            return_str = return_str + '\nKruskal-Wallis H-test: Statistics=%.3f, p=%s' % (stat, p)
            final_return_sum = "p\t" + str(p) + "\t" + return_sum
            pval = p

        except:
            return_str = return_str + '\nKruskal-Wallis H-test: Failed'
            final_return_sum = "p\t" + str(1) + "\t" + return_sum
            #return return_str, final_return_sum

    else:
        return_str = return_str + '\nKruskal-Wallis H-test: Failed'
        final_return_sum = "p\t" + str(1) + "\t" + return_sum
        #return return_str, final_return_sum
    return_info["pval"] = pval
    return return_info

def meta_sub_selection(meta_data, feat_field_name, selected_feat):

    meta_data_temp = meta_data.dropna(subset=[feat_field_name])

    meta_sub = meta_data_temp.groupby(feat_field_name).get_group(selected_feat)
    meta_sub_final = meta_sub.dropna(subset=[feat_field_name])

    return meta_sub_final


def draw_km_plot(input_data_meta, target_feat, output_file_name, os_feat_name = "os_month", os_status_feat_name = "os_status", tag="", replace_dic=None,
                 pval_in_title=True, pval_threshold=0.99, plotting=True, minimun_number_for_km_plot = 4):

    return_info = {}
    return_info["error"] = False
    return_str = tag
    # from lifelines import KaplanMeierFitter

    metadata_cancer_survival = input_data_meta[
        input_data_meta[[os_feat_name, os_status_feat_name, target_feat]].notna().all(1)]
    metadata_cancer_survival_sub = metadata_cancer_survival[metadata_cancer_survival[target_feat].notna()]
    # metadata_cancer_survival_sub.to_csv("metadata_cancer_survival_sub.csv",index=True)
    print("number of cases good for survival analysis:", metadata_cancer_survival_sub.shape[0])
    if metadata_cancer_survival_sub.shape[0] < minimun_number_for_km_plot:
        print("The number of samples are too small for this analysis!")
        error_message = {"loc": "draw_km_plot", "message": "The number of samples are too small for this analysis!", "error" : True}
        return_info["error"] = True
        return error_message

    if replace_dic == None:
        temp_feat_val_list = metadata_cancer_survival_sub[os_status_feat_name].unique().tolist()

        if len(temp_feat_val_list) <2:
            print("There is only one class labels after the filtering: %s" % temp_feat_val_list)
            error_message = {"loc": "draw_km_plot", "message": "There is only one class labels after the filtering",
                             "error": True}
            return_info["error"] = True
            return error_message



        if "DECEASED" in temp_feat_val_list and "LIVING" in temp_feat_val_list:
            metadata_cancer_survival_sub.replace({'DECEASED': 1, 'LIVING': 0}, inplace=True)
        elif "1" in temp_feat_val_list and "0" in temp_feat_val_list:
            metadata_cancer_survival_sub.replace({'1': 1, '0': 0}, inplace=True)
        elif "1.0" in temp_feat_val_list and "0.0" in temp_feat_val_list:
            metadata_cancer_survival_sub.replace({'1.0': 1, '0.0': 0}, inplace=True)
        elif "dead" in temp_feat_val_list and "alive" in temp_feat_val_list:
            metadata_cancer_survival_sub.replace({'dead': 1, 'alive': 0}, inplace=True)
        elif "Dead" in temp_feat_val_list and "Alive" in temp_feat_val_list:
            metadata_cancer_survival_sub.replace({'Dead': 1, 'Alive': 0}, inplace=True)
        elif "DEAD" in temp_feat_val_list and "ALIVE" in temp_feat_val_list:
            metadata_cancer_survival_sub.replace({'DEAD': 1, 'ALIVE': 0}, inplace=True)

    T = metadata_cancer_survival_sub[os_feat_name].astype("float").values
    E = metadata_cancer_survival_sub[os_status_feat_name].astype("int64").values
    G = metadata_cancer_survival_sub[target_feat].values
    result = multivariate_logrank_test(T, G, E)

    kmf = KaplanMeierFitter()
    ax1 = plt.subplots(dpi=600)

    return_str = return_str + "\t" + str(result.p_value)
    return_info["pval"] = str(result.p_value)
    return_info["feat_list"] = []

    target_feat_val_list = metadata_cancer_survival_sub[target_feat].unique().tolist()
    target_feat_val_list.sort()

    groups = metadata_cancer_survival_sub[target_feat]

    T_list = []
    E_list = []
    G_list = []
    median_survival_time_str = ""
    for feat_i in target_feat_val_list:
        # print(feat_i)
        ix1 = (groups == feat_i)  ## Cohort 1
        T_list.append(T[ix1])
        E_list.append(E[ix1])
        G_list.append(feat_i)
        # kmf.fit(T[ix1], E[ix1], label=feat_i)    ## fit the cohort 1 data
        kmf.fit(T[ix1], E[ix1], label=feat_i + " (" + str(len(T[ix1])) + ")")  ## fit the cohort 1 data

        median_st = feat_i + "\t" + str(len(T[ix1])) + "\t" + str(kmf.median_survival_time_)

        return_info["feat_list"].append(feat_i)
        return_info[feat_i] = {}
        return_info[feat_i]["median"] = kmf.median_survival_time_
        return_info[feat_i]["size"] = len(T[ix1])
        #return_info["med_surv_time|" + feat_i] = str(kmf.median_survival_time_)


        median_survival_time_str = median_survival_time_str + "\t" + median_st
        #print(median_st)
        if plotting:
            if feat_i != target_feat_val_list[-1]:
            #if feat_i != target_feat_val_list:
                if feat_i == "high":
                    ax1 = kmf.plot(ci_show=False, color="red")
                elif feat_i == "high/high":
                    ax1 = kmf.plot(ci_show=False, color="red")
                elif feat_i == "low/low":
                    ax1 = kmf.plot(ci_show=False, color="blue")
                elif feat_i == "high/low":
                    ax1 = kmf.plot(ci_show=False, color="green")
                elif (feat_i == "low/high" or feat_i == "zero" or feat_i == "none"):
                    ax1 = kmf.plot(ci_show=False, color="gray")
                elif feat_i == "low":
                    ax1 = kmf.plot(ci_show=False, color="blue")
                elif "zero" in feat_i:
                    ax1 = kmf.plot(ci_show=False, color="gray")
                else:
                    ax1 = kmf.plot(ci_show=False)
                ax1.set_ylim([0.0, 1.1])

    if pval_in_title:
        result_pval_str = "%.4f" % result.p_value
        if tag.endswith("_"):
            tag = tag[:-1]
        tag = tag + ", p-Value = " + result_pval_str

    if tag.startswith("TCGA PanCanAtlas Cancer Type Acronym"):
        tag = tag.replace("TCGA PanCanAtlas Cancer Type Acronym_", "")

    if pval_threshold > result.p_value and plotting:
        try:

            kmf.plot(ax=ax1, figsize=(10, 6), ci_show=False, title=tag, color='blue').legend(
                bbox_to_anchor=(1, 1))  # .draw()
            # kmf.plot(ax=ax1, figsize=(10, 6), ci_show=False, title=tag).legend(
            #     bbox_to_anchor=(1, 1))  # .draw()
            ax1.set_ylabel("Overall Survival", weight='bold')
            ax1.set_xlabel("Months", weight='bold')
            # ax1.set_xlabel("Months")
            tag_for_file_name = tag
            if "/" in tag:
                tag_for_file_name = tag.replace("/", "_")
            plt.savefig(output_file_name, dpi=600)

        except:
            print("Couldn't plot this: %s" % tag)

    return_info["file_addr"] = output_file_name
    return return_info




if __name__ == "__main__":
    main()