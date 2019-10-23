# Parsers
import os
from datetime import datetime

# Parse datetime
def parse_date(time):
    for date_format in ['%Y%m%d', '%Y-%m-%d']:
        try:
            return datetime.strptime(time, date_format).strftime('%Y-%m-%d')
        except ValueError:
            pass

    raise ValueError("No valid time format.")


# Guessannotation folder
def guess_ano_folder(base_path):
    for f_n in ['Annotation', 'Annotations', 'annotation', 'annotations']:
        ano_path = os.path.join(base_path, f_n)
        if os.path.exists(ano_path):
            return ano_path

    raise ValueError("No valid annotation folder format.")


# Guessimage folder
def guess_img_folder(base_path):
    for f_n in ['JPEGImage', 'JPEGImages', 'image', 'images']:
        img_path = os.path.join(base_path, f_n)
        if os.path.exists(img_path):
            return img_path

    raise ValueError("No valid image folder format.")