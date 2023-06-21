#import share_funcs_3
from .aa_tool import aa_tool
import re

# L2,L3
# 163	L2
# 195	L2
# 236	L3
# 251	L3

# DISRUPTIVE MUTATIONS:
# 1) All DNA sequence alterations that introduce a STOP sequence resulting in disruption of p53 protein production or
# 2) Any DNA sequence alteration which:
# 	a) occurs within the L2, or L3 binding domains (codons 163-195 or 236-251)
# 	AND
# 	b) replaces an amino acid from one polarity/charge category (see table) with an amino acid from another category.

# Rule 1:
# These will be the truncating mutations and inframe
# In the cBioPortal, eg:
# FS del
# X187_splice
# There is ended with a * (e.g. R196*)
#
# Missense:
# R273C
# R248Q
# Etc

l2_start = 163
l2_end = 195
l3_start = 236
l3_end = 251

# l2_start = 164
# l2_end = 194
# l3_start = 237
# l3_end = 250

def main():
    print("")
    mutation_example = "P239*"
    disr = tp53_disruptive()


class tp53_disruptive():

    def __init__(self):
        self.aatool = aa_tool()

    def is_disruptive(self, mut_raw:str):
        #print(mut_raw)
        mut = mut_raw.strip().lower()
        if mut.startswith("p."):
            mut = mut[2:]

        # Synonymous mutation
        if mut.endswith("="):
            return False

        # simple rules (Rule 1) first
        if mut.endswith("*"):
            return True
        elif mut.lower().endswith("x"):
            return True
        elif "stop" in mut:
            return True


        # check if it is WNM
        # "WNM": "[A-z][\-\_0-9]+[A-z*]"
        wnm_patt = "[A-z][\-\_0-9]+[A-z*]"
        wnm_re = re.compile(wnm_patt)

        if "splice" in mut or "del" in mut or "fs" in mut:
            mut_loc = re.findall(r'\d+', mut)[0]
            wildtype = mut[0]
            if self.in_l2l3(mut_loc):
                return True

        elif wnm_re.match(mut):
            print(":WNM")
            #this is WNM or other dna sequence alteration
            mut_loc = re.findall(r'\d+', mut)[0]

            wildtype = mut[0]
            muttype = mut[-1]

            if self.in_l2l3(mut_loc):
                if self.aatool.polar_change(wildtype, muttype):
                    print(":polar_charge_change = True")
                    return True
                else:
                    print(":polar_charge_change = False")
                    False

        # check the location

    def in_l2l3(self, loc_int):

        if type(loc_int) is str:
            loc_int = int(loc_int.strip())
        #print(loc_int)
        if (loc_int>= l2_start and loc_int <= l2_end) or (loc_int>= l3_start and loc_int <= l3_end):
            return True
        else:
            return False


    def is_truncate(self, mut_raw:str):
        #print(mut_raw)
        mut = mut_raw.strip().lower()
        if mut.startswith("p."):
            mut = mut[2:]

        #Synonymous mutation
        if mut.endswith("="):
            return False

        # simple rules (Rule 1) first
        if mut.endswith("*") and mut.startswith("*"):
            return False
        elif mut.endswith("*"):
            return True
        elif mut.lower().endswith("x"):
            return True
        elif "stop" in mut:
            return True
        if "splice" in mut or "del" in mut or "fs" in mut:
            return True

        trun_patt = "[A-z][\-\_0-9]+[*]"
        trun_re = re.compile(trun_patt)

        if trun_re.match(mut):
            #print(":truncate: %s" % mut_raw)
            return True
        else:
            return False

    def is_missense(self, mut_raw: str):
        #print(mut_raw)
        mut = mut_raw.strip().lower()
        if mut.startswith("p."):
            mut = mut[2:]

        # Synonymous mutation
        if mut.endswith("="):
            return False

        # check if it is WNM

        wnm_patt = "[A-z][\-\_0-9]+[A-z]"
        wnm_re = re.compile(wnm_patt)


        if wnm_re.match(mut):
            #print(":missense: %s" % mut_raw)
            return True
        else:
            return False


if __name__ == "__main__":
    main()