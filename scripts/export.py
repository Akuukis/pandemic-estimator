#!/usr/bin/env python3

import os
import sqlite3
import json
import pycountry


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

def extract_location(country_city):

    location = {
        'status': None,
        'country': None,
        'county': None,
        'subdivision': None, # County or City
        'original': country_city
    }

    country = country_city[0].strip()

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

    }

    if country in hardcoded_countries.keys():
        country_search = pycountry.countries.get(alpha_3=hardcoded_countries[country])
        location['country'] = country_search

        if city:
            print(country_city)

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
            print(country_city)

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

    print(country_city)
    print(pycountry.countries.search_fuzzy(country))

    return location


if __name__ == '__main__':

    conn = sqlite3.connect(os.path.join('tmp', 'raw_data.sqlite3'))

    filepath_out = os.path.join('static', 'domains.json')

    c = conn.cursor()

    c.execute('SELECT country, city FROM records group by country, city order by country, city asc')

    countries_cities = c.fetchall()

    countries_arr = []

    for country_city in countries_cities:
        c2 = conn.cursor()
        c2.execute('SELECT date, confirmed, deaths, recovered FROM records where country = ? and city = ? order by date asc', country_city)

        cases = c2.fetchall()

        countries_records_arr = []

        for case in cases:
            countries_records_arr.append([case[0].split(' ')[0], case[1], case[2], case[3]])

        location_data = extract_location(country_city)

        if location_data['status'] == 'error_not_found':
            print(country_city)
        else:
            countries_arr.append({
                "country": location_data['country'].name,
                "county": location_data['county'],
                "subdivision": location_data['subdivision'],
                "cases": countries_records_arr
            })

    with open(filepath_out, 'w') as outfile:
        json.dump(countries_arr, outfile)
