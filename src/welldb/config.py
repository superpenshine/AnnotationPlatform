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

def get_config():
    config, unparsed = parser.parse_known_args()
    return config, unparsed

def print_usage():
    parser.print_usage()
