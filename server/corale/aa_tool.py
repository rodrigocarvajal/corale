import re
import sys
sys.path.append('..')
from services.ConfigReader import ConfigReader
# LEGEND
# NP	nonpolar
# PU	polar uncharged
# PP	polar positively charged
# PN	polar negatively charged

env_config = ConfigReader()

aa_table_file_addr = env_config.get_config()['CORALE_AA_POLARITY_TABLE']

def main():

    at = aa_tool()
    print(at.conv_1_3("N"))
    print(at.conv_3_1("Asn"))
    print(at.polar_change("Asn", "Glu"))
    print(at.polar_change("Asp", "Glu"))


class aa_tool:
    #aa_all_list = []
    def __init__(self):
        self.aa_all_list = self.load_aa_table(aa_table_file_addr)

    def get_polar(self, aa_raw:str):
        aa_raw = aa_raw.strip()
        if len(aa_raw) == 1:
            aa_raw = aa_raw.upper()
            aa_3 = self.conv_1_3(aa_raw)
        else:
            aa_3 = aa_raw.lower()
        i_of_aa = self.aa_all_list[2].index(aa_3)
        aa_charge = self.aa_all_list[3][i_of_aa]
        aa_polar = self.aa_all_list[4][i_of_aa]

        if aa_polar.startswith("nonpolar"):
            return "NP"
        elif aa_polar.startswith("polar"):
            if aa_charge.startswith("+"):
                return "PP"
            elif aa_charge.startswith("-"):
                return "PN"
            elif aa_charge.startswith("neutral"):
                return "PU"
        else:
            print("Something is WRONG!")

    def polar_change(self, aa_a:str, aa_b:str):
        if aa_a == aa_b:
            return False

        polar_a = self.get_polar(aa_a)
        polar_b = self.get_polar(aa_b)
        if polar_a == polar_b:
            return False
        else:
            return True

    def conv_1_3(self, aa_1:str):
        aa_1 = aa_1.upper().strip()

        i_of_aa = self.aa_all_list[1].index(aa_1)
        return self.aa_all_list[2][i_of_aa]

    def conv_3_1(self, aa_3: str):
        aa_3 = aa_3.lower().strip()

        i_of_aa = self.aa_all_list[2].index(aa_3)
        return self.aa_all_list[1][i_of_aa]

    def load_aa_table(self, input_file_addr):
        aa_full = []
        aa_one = []
        aa_three = []
        aa_charge = []
        aa_polar = []


        counter = 0
        with open(input_file_addr, 'r', encoding='utf-8') as f:
            for line in f:
                line_split = line.strip().split("\t")
                if counter >0:
                    aa_full.append(line_split[0].strip())
                    aa_one.append(line_split[1].strip())
                    aa_three.append(line_split[2].lower().strip())
                    aa_charge.append(line_split[3].strip())
                    aa_polar.append(line_split[4].strip())
                counter += 1
        aa_all = [aa_full, aa_one, aa_three, aa_charge, aa_polar]
        return aa_all

def amino_three_to_one(aa_three:str):
    aa = aa_three.strip().lower()
    aa_dic = {
        "ala": "A", "arg": "R", "asn": "N", "asp": "D", "asx": "B", "cys": "C", "glu": "E", "gln": "Q", "glx": "Z", "gly": "G", "his": "H", "ile": "I", "leu": "L", "lys": "K", "met": "M", "phe": "F", "pro": "P", "ser": "S", "thr": "T", "trp": "W", "tyr": "Y", "val": "V",
    }
    if aa in aa_dic:
        return aa_dic[aa]
    else:
        return None

if __name__ == "__main__":

    main()
