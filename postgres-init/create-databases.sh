#!/bin/sh
# Creates every per-service database that does not exist yet. Safe to run any number of times.
# (postgres/docker-entrypoint only runs init scripts on the very first start of a *new* volume,
#  so a volume created by an older version of this project could be missing some databases.)
set -eu

for db in auth_db course_db module_db assessment_db progress_db marking_db scheduling_db notification_db; do
  exists="$(psql -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${db}'")"
  if [ "${exists}" != "1" ]; then
    echo "[db_init] creating database ${db}"
    psql -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE ${db}"
  else
    echo "[db_init] database ${db} already exists"
  fi
done
echo "[db_init] done"
