import os

class ConfigReader():

    def __init__(self):
        self.production = os.environ['FCORALE_PRODUCTION']
        self.uat        = os.environ['FCORALE_UAT']

    def _create_dict(self, config_vars):
        d_config_vars = {}

        for var in config_vars:
            s = var.split('=')
            d_config_vars[s[0]] = s[1]

        return d_config_vars

    def get_config(self):

        if self.production == 'true' and self.uat == 'false':
            filename = '.env.prod'

        elif self.production == 'false' and self.uat == 'true':
            filename = '.env.uat'

        else:
            filename = '.env.dev'

        config_vars = []
        passthru = [ config_vars.append(row.strip('\n')) for row in open(filename) ]

        return self._create_dict(config_vars)