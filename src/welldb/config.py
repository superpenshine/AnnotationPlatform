# Configuration file, imported in welldb/settings.py.
# Usage: from welldb.settings import get_config, print_usage

import os
import argparse

arg_lists = []
parser = argparse.ArgumentParser()


def add_argument_group(name):
    arg = parser.add_argument_group(name)
    arg_lists.append(arg)
    return arg


sys_arg = add_argument_group("System")

# Email Settings
sys_arg.add_argument("--email_host", type=str,
                    default="smtp.exmail.qq.com",
                    help="SMTP server address.")

sys_arg.add_argument("--smtp_usr", type=str,
                    default="haotian.shen@westwell-lab.com",
                    help="Specifies the username smtp server uses to send the notification.")

sys_arg.add_argument("--smtp_pwd", type=str,
                    default="Westwell123",
                    help="Specifies the password smtp server uses to authenticate.")

sys_arg.add_argument("--smtp_sender_name", type=str,
                    default="HaotianShen",
                    help="Specifies the sender in the email header. Ex: Mr:Shen")

sys_arg.add_argument("--smtp_from_usr", type=str,
                    default="haotian.shen",
                    help="Specifies the usr name in the email header. Ex: haotian.shen")

sys_arg.add_argument("--smtp_sender_host", type=str,
                    default="westwell-lab.com",
                    help="Specifies the host name in the email header. Ex: gmail.com")

sys_arg.add_argument("--smtp_receiver_host", type=str,
                    default="westwell-lab.com",
                    help="Specifies the receiver side host. Ex: qq.com")


# NAS Settings
sys_arg.add_argument("--nas_pwd", type=str,
                    default="westwell123",
                    help="NAS password.")

sys_arg.add_argument("--nas_usr", type=str,
                    default="junhong",
                    help="NAS username.")

sys_arg.add_argument("--nas_addr", type=str,
                    default="192.168.105.19",
                    help="NAS address.")

sys_arg.add_argument("--nas_stor", type=str,
                    default="/volume1/public/data_collected",
                    help="NAS storage url.")


# Local storage settings
sys_arg.add_argument("--img_path", type=str,
                    default='/home/wwl/datasets_default/JPEGImages',
                    help="Local major storage path for JPEGImages")

# # Params you want to change for local system uses
# sys_arg.add_argument("--num_iter", type=int,
#                     default=50,
#                     help="Number of iterations to run for each set of hyper-parameter")

# sys_arg.add_argument("--search_method", type=str,
#                     default="bayesian",
#                     choices=["grid", "random", "bayesian"], 
#                     help="Hyper parameter serach method")

# sys_arg.add_argument("--blackbox_func_dir", type=str,
#                     # default="../blackbox_samples/pytorch_cifar10",
#                     default="../blackbox_samples/styblinski_tang",
#                     # default="https://github.com/superpenshine/pytorch_cifar10.git",
#                     help="Local directory to folder containing the blackbox function such as the " + 
#                     "styblinski_tang folder or the pytorch_cifar10 folder.")

# sys_arg.add_argument("--param_space_dir", type=str,
#                     # default="../blackbox_samples/pytorch_cifar10/parameter_space.json",
#                     # default="../blackbox_samples/pytorch_cifar10/parameter_space_bo.json",
#                     # default="../blackbox_samples/styblinski_tang/parameter_space.json",
#                     default="../blackbox_samples/styblinski_tang/parameter_space_bo.json",
#                     help="Local directory to parameter_space.json") 

# sys_arg.add_argument("--eval_env_config_dir", type=str,
#                     # default="../blackbox_samples/pytorch_cifar10/environment_config.json",
#                     default="../blackbox_samples/styblinski_tang/environment_config.json",
#                     help="Local directory to environment_config.json")

# sys_arg.add_argument("--excluded", type=str,
#                     default=["../blackbox_samples/pytorch_cifar10/models/useless_folder", 
#                          "../blackbox_samples/pytorch_cifar10/models/uselessfile*.txt"],
#                     help="Local directory to environment_config.json")

# # Additional features
# sys_arg.add_argument("-m", "--mode", type=str,
#                     default="n",
#                     help="Select run mode, the default is \'n\'. n: new, r: resume, p: plot, np: " + 
#                     "new + plot, rp: resume + plot, i: information. You can also use np or rp.")

# sys_arg.add_argument("--plot_params", type=str,
#                     default="",
#                     help="List of hyper-parameter name(s) you want to visualize, seperate using " + 
#                     "single spaces. Otherwise, use empty string \"\" to disable the 3d plot " + 
#                     "feature")

# sys_arg.add_argument("--plot_2d_mode", type=str,
#                     default="s",
#                     choices=["l", "line", "s", "scatter"],
#                     help="Specify the 2d visualization mode")

# sys_arg.add_argument("--plot_3d_mode", type=str,
#                     default="sc",
#                     choices=["sc", "scatter", "wf", "wireframe", "sf", "surface"],
#                     help="Specify the 3d visualization mode, note that it is impossible to " + 
#                     "generate wireframe or surface plot if not using grid search")

# sys_arg.add_argument("--plot_preview", type=bool,
#                     default=True,
#                     help="Preview the plot before saving. This also works on 3D plots, enabling " + 
#                     "viewing gesture change")

# sys_arg.add_argument("--venv_dir", type=str,
#                     default=None,
#                     help="Provide local directory to virtual environment that you are using, if " + 
#                     "you want to use the environment replication feature. No additional virtual " + 
#                     "environment feature will be configured if this feature is in use")

# # Params that could be ignored safely
# sys_arg.add_argument("--local_work_dir", type=str,
#                     default="./prepare",
#                     # default="./custom/prepare",
#                     help="Local folder gathering all files to be uploaded")

# sys_arg.add_argument("--rst_dir", type=str,
#                     default="./prepare/results",
#                     # default="./custom/prepare/results",
#                     help="Local file recording all trials and observations")

# sys_arg.add_argument("--opt_dir", type=str,
#                     default="./prepare/opt",
#                     # default="./custom/prepare/opt",
#                     help="Local file containing optimal set of parameters")

# sys_arg.add_argument("--check_interval", type=int,
#                     default=30,
#                     help="Time interval (sec) to check if jobs finished on remote, set it to " + 
#                     "values larger than 10 secs")

# sys_arg.add_argument("--retry_interval", type=int,
#                     default=5,
#                     help="Time interval (sec) to retry any unsuccessful query to the remote " + 
#                     "caused by network interruption")

# sys_arg.add_argument("--max_bo_iter", type=int,
#                     default=100,
#                     help="Maximum number of Bayesian optimization iterations, setting it too " + 
#                     "large lead to minor improvement with longer evaluation time, setting it " + 
#                     "too small will return a sub-optimal satisfying tuning result")

# sys_arg.add_argument("--num_parallel_bo", type=int,
#                     default=5,
#                     help="Number of parallel evaluations for Bayesian Optimization, set it too " + 
#                     "large lead to inefficient evaluation, set it to 1 indicades a serial " + 
#                     "evaluation")

# ##############################################################

# # Params you want to change for remote system use
# remote_arg = add_argument_group("Remote")

# remote_arg.add_argument("-u", "--user_name", type=str,
#                     default="sht",
#                     help="Cluster account name")

# remote_arg.add_argument("-a", "--account", type=str,
#                     default="def-wkui",
#                     help="Slurm account to use. "
#                     "Please change this to your compute canada account")

# remote_arg.add_argument("--pri_key_dir", type=str,
#                     default="~/keys/ComputeCanada/id_rsa",
#                     help="Private key file directory")

# remote_arg.add_argument("--host_names",
#                     # default=['cedar.computecanada.ca', 'graham.computecanada.ca', 'beluga.computecanada.ca'],
#                     default=['cedar.computecanada.ca', 'graham.computecanada.ca'],
#                     # default=['graham.computecanada.ca', 'beluga.computecanada.ca'],
#                     # default=['cedar.computecanada.ca'],
#                     # default=['graham.computecanada.ca'],
#                     action = 'store',
#                     help="Remote hosts for evaluation, use this option to redefine list of " + 
#                     "remote hosts(seprate using spaces). Ex: subdomain.domain_name")

# remote_arg.add_argument("-t", "--job_run_time", type=str,
#                     default="0-00:10",
#                     help="Atomic run time for one job, in form of dd-hh:mm")

# # Params that could be safely ignored
# remote_arg.add_argument("--remote_work_dir", type=str,
#                     default="~/scratch/jobs",
#                     help="Remote work directory to store jobs waiting to be evaluated")

# remote_arg.add_argument("--remote_work_output_dir", type=str,
#                     default="~/scratch/jobs/reports",
#                     help="Temprary report directory")

# remote_arg.add_argument("--remote_venv_dir", type=str,
#                     default="~/scratch/venv",
#                     help="Remote dir to create virtual environment")

def get_config():
    config, unparsed = parser.parse_known_args()
    return config, unparsed

def print_usage():
    parser.print_usage()
