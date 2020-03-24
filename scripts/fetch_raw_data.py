#!/usr/bin/env python3

import urllib.request
import sqlite3
import os
import csv
from datetime import date, timedelta, datetime

url_template = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/{:02d}-{:02d}-2020.csv"


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
                    line_count += 1
                    continue

                records.append((row[0], row[1], current_date, row[3], row[4], row[5]))
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
