#!/usr/bin/env python3

import os
import sqlite3
import json
import pycountry
from datetime import date, timedelta


def sanitize_record(record_data):
    if not record_data:
        return record_data

    record_data = list(record_data)

    record_data[0] = record_data[0].strip()
    record_data[1] = sanitize_int(record_data[1])
    record_data[2] = sanitize_int(record_data[2])
    record_data[3] = sanitize_int(record_data[2])

    return record_data

def sanitize_int(input):
    if (input == ""):
        return 0

    return input

def is_missing_last_datapoint(cases):
    yesterday = date.today() - timedelta(days=1)
    for case in cases:
        if date.fromisoformat(case[0]) == yesterday:
            return False

    # print(yesterday, [x[0] for x in cases])
    return True

def is_with_gaps(cases):
    days = (date.fromisoformat(cases[-1][0]) - date.fromisoformat(cases[0][0])).days

    if days == len(cases) - 1:
        return False
    else:
        # print(days, [x[0] for x in cases])
        return True

    return days != len(cases) - 1

def force_cumulative_confirmed(cases):
    error_count = 0
    curr_value = 0
    for case in cases:
        value = int(case[1])
        if value < curr_value:
            error_count = error_count + 1
            case[1] = curr_value
        else:
            curr_value = value

    if error_count > 0:
        return True
    else:
        return False

def force_cumulative_deaths(cases):
    error_count = 0
    curr_value = 0
    for case in cases:
        value = int(case[2])
        if value < curr_value:
            error_count = error_count + 1
            case[2] = curr_value
        else:
            curr_value = value

    if error_count > 0:
        return True
    else:
        return False

def force_cumulative_recovered(cases):
    error_count = 0
    curr_value = 0
    for case in cases:
        value = int(case[3])
        if value < curr_value:
            error_count = error_count + 1
            case[3] = curr_value
        else:
            curr_value = value

    if error_count > 0:
        return True
    else:
        return False

def extract_location(country_city):

    location = {
        'status': None,
        'country': None,
        'county': None,
        'subdivision': None, # County or City
        'original': country_city
    }

    country = country_city[0].strip()

    if country == 'France':
        # Sadly, France is fragmented across 2 entries and even them are missing entries.
        # To avoid confusion, drop all France subdivisions too.
        location['status'] = 'error_not_found'
        return location

    if country == 'US':
        country = 'United States'

    if country == 'UK':
        country = 'United Kingdom'

    if country == 'Mainland China':
        country = 'China'

    if country == 'The Bahamas':
        country = 'Bahamas'

    if country == 'Republic of the Congo':
        country = 'Congo'

    if country == 'Russia':
        country = 'Russian Federation'

    if country == 'Czech Republic':
        country = 'Czechia'

    if country == "Cote d'Ivoire":
        country = "Côte d'Ivoire"

    if country == "Kosovo":
        country = "Serbia"

    if country == "Saint Barthelemy":
        country = "Saint Barthélemy"

    if country == "Viet Nam":
        location['status'] = 'error_not_found'
        return location


    city = country_city[1].strip()

    # get country
    hardcoded_countries = {
        'Curacao': 'FRA',
        'Guadeloupe': 'FRA',
        'Iran': 'IRN',
        'Mayotte': 'FRA',
        'Reunion': 'REU',
        'Taiwan': 'TWN',
        'Brunei': 'BRN',
        'Bolivia': 'BOL',
        'Republic of Korea': 'PRK',
        'Republic of Moldova': 'MDA',
        'Palestine': 'PSE',
        'Holy See': 'VAT',
        'Saint Martin': 'MAF',
        'Vatican City': 'VAT',
        'Nigeria': 'NGA',
        'Niger': 'NER',
    }

    if country in hardcoded_countries.keys():
        country_search = pycountry.countries.get(alpha_3=hardcoded_countries[country])
        location['country'] = country_search

        if city:
            # print(country_city)
            pass

        return location
    else:
        try:
            country_search = pycountry.countries.search_fuzzy(country)

            if len(country_search) > 1:
                if (country_search[0].name == country):
                    location['country'] = country_search[0]
                else:
                    print("[ERROR] Many results for country: " + country + ":")
                    print(country_search)
            else:
                location['country'] = country_search[0]

        except LookupError:
            location['status'] = 'error_not_found'


    # valstij nav iso
    if not location['country']:
        if city:
            # print(country_city)
            pass

        location['status'] = 'error_not_found'
        return location

    country_name = ''
    if hasattr(location['country'], 'common_name'):
        country_name = location['country'].common_name
    else:
        country_name = location['country'].name

    if location['country'] and country_name == country and city == '':
        location['status'] = 'only_country'
        return location

    if city and location['country']:

        if location['country'].name == "United States" and ',' in city:
            (location['subdivision'], location['county']) = city.split(', ')
        else:
            location['subdivision'] = city

        return location

    # print(country_city)
    # print(pycountry.countries.search_fuzzy(country))

    return location


if __name__ == '__main__':

    conn = sqlite3.connect(os.path.join('tmp', 'raw_data.sqlite3'))

    filepath_out = os.path.join('static', 'domains.json')

    c = conn.cursor()

    c.execute('SELECT country, city FROM records group by country, city order by country, city asc')

    countries_cities = c.fetchall()

    countries_arr = []

    for country_city in countries_cities:
        location_data = extract_location(country_city)
        if location_data['status'] == 'error_not_found':
            print('[ERROR] Unknown location: ' + debug_details)
            continue
        debug_details = 'country="' + country_city[0] + '", subdivision="' + country_city[1] + '"'

        c2 = conn.cursor()
        c2.execute('SELECT date, confirmed, deaths, recovered FROM records where country = ? and city = ? order by date asc', country_city)

        countries_records_arr = []
        for case in c2.fetchall():
            countries_records_arr.append([case[0].split(' ')[0], case[1], case[2], case[3]])
        countries_records_arr = sorted(countries_records_arr, key=lambda case: case[0])

        if is_missing_last_datapoint(countries_records_arr):
            print('[ERROR] Missing last datapoint: ' + debug_details)
            continue

        if is_with_gaps(countries_records_arr):
            print('[ERROR] Dataseries have gap(s): ' + debug_details)
            continue

        if force_cumulative_confirmed(countries_records_arr):
            print('[WARN ] Fixed cumulative "confirmed": ' + debug_details)

        if force_cumulative_deaths(countries_records_arr):
            print('[WARN ] Fixed cumulative "deaths": ' + debug_details)

        if force_cumulative_recovered(countries_records_arr):
            print('[WARN ] Fixed cumulative "recovered": ' + debug_details)

        countries_arr.append({
            "country": location_data['country'].name,
            "county": location_data['county'],
            "subdivision": location_data['subdivision'],
            "cases": countries_records_arr
        })
        print('[INFO ] Done: ' + debug_details)

    with open(filepath_out, 'w') as outfile:
        json.dump(countries_arr, outfile)
