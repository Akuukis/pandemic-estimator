#!/usr/bin/env python3

from unicodedata import normalize, name
import urllib.request
import sqlite3
import os
import csv
from datetime import date, timedelta, datetime

url_template = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/{:02d}-{:02d}-2020.csv"

def normalize_zero(something):
    if isinstance(something, int):
        return something
    if isinstance(something, str):
        if something == '':
            return 0
        else:
            return int(something)

def isVer1(headerRow):
    HEAD = '\uFEFFProvince/State,Country/Region,Last Update,Confirmed,Deaths,Recovered'
    return ','.join(headerRow) == HEAD

def isVer2(headerRow):
    HEAD = 'FIPS,Admin2,Province_State,Country_Region,Last_Update,Lat,Long_,Confirmed,Deaths,Recovered,Active,Combined_Key'
    return ','.join(headerRow) == HEAD

def parseVersion1(row, date):
    """
    returns:
        tuple of (city, country, date, confirmed, deaths, recovered)
    """
    return (row[0], row[1], date, normalize_zero(row[3]), normalize_zero(row[4]), normalize_zero(row[5]))

def parseVersion2(row, date):
    """
    returns:
        tuple of (city, country, date, confirmed, deaths, recovered)
    """
    return (row[2], row[3], date, normalize_zero(row[7]), normalize_zero(row[8]), normalize_zero(row[9]))

if __name__ == '__main__':
    records = []
    current_date = date(2020, 1, 23)  # First entry ever.
    while True:
        url = url_template.format(current_date.month, current_date.day)
        filepath = os.path.join('tmp', '2020-{:02d}-{:02d}.csv'.format(current_date.month, current_date.day))

        try:
            if not os.path.isfile(filepath):
                urllib.request.urlretrieve(url_template.format(current_date.month, current_date.day), filepath)
                print('Cached ' + filepath)
        except urllib.error.HTTPError:
            # Break, because either data is not published yet or it's already tomorrow.
            break

        with open(filepath) as csv_file:

            csv_reader = csv.reader(csv_file, delimiter=',')
            line_count = 0
            for row in csv_reader:
                if line_count == 0: #skip header
                    if(isVer1(row)):
                        parser = parseVersion1
                    if(isVer2(row)):
                        parser = parseVersion2

                    if('parser' not in vars()):
                        print('error: No parser for "' + filepath + '": ' + ','.join(row))
                        raise Exception()

                    line_count += 1
                    continue

                records.append(parser(row, current_date))
                line_count += 1

        current_date = current_date + timedelta(days=1)

    filepath_db = os.path.join('tmp', 'raw_data.sqlite3')
    os.remove(filepath_db)
    conn = sqlite3.connect(filepath_db)
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS records (
        city text,
        country text NOT NULL,
        date date NOT NULL,
        confirmed integer NOT NULL,
        deaths integer NOT NULL,
        recovered integer NOT NULL
    );''')
    cursor.executemany('INSERT INTO records VALUES (?,?,?,?,?,?)', records)
    conn.commit()
    conn.close()
