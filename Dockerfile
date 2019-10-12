FROM python:3.7

ENV PYTHONUNBUFFERED 1
RUN mkdir -p /opt/services/welldb/src
COPY docker/django/requirements.txt /opt/services/welldb/src/


RUN pip3 config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple &&\
    pip3 install -r /opt/services/welldb/src/requirements.txt &&\
    pip3 install -U pip

COPY src /opt/services/welldb/src/
COPY docker/django/supervisor/welldb.conf /etc/supervisord.conf
WORKDIR /opt/services/welldb/src
RUN python manage.py collectstatic --no-input

EXPOSE 21000
CMD ["/usr/local/bin/supervisord"]
#CMD ["gunicorn", "-c", "welldb/gunicorn.conf.py", "--bind", ":21000", "welldb.wsgi:application"]