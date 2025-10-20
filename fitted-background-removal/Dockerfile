# Dockerfile
FROM public.ecr.aws/lambda/python:3.12

RUN dnf update -y && \
    dnf install -y \
    gcc \
    gcc-c++ \
    make \
    cmake \
    mesa-libGL \
    mesa-libGL-devel \
    libavif \
    libavif-devel \
    && dnf clean all


COPY requirements.txt ${LAMBDA_TASK_ROOT}

RUN pip install --upgrade pip

RUN pip install -r requirements.txt

COPY app.py ${LAMBDA_TASK_ROOT}
COPY background_removal.py ${LAMBDA_TASK_ROOT}
COPY lambda_handler.py ${LAMBDA_TASK_ROOT}

ENV PYTHONUNBUFFERED=1
ENV U2NET_HOME=/tmp/.u2net

CMD ["lambda_handler.lambda_handler"]