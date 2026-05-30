export const demoHouseholdDictionaryCsv = [
  'variable_name,variable_label,data_type,role,value_labels,missing_codes,valid_min,valid_max,notes,extra_source',
  'household_id,Household identifier,string,identifier,,,,,Primary household ID,HH questionnaire',
  'strata,Sampling stratum,string,stratum,,,,,,HH questionnaire',
  'psu,Primary sampling unit,string,psu,,,,,,HH questionnaire',
  'weight,Final household survey weight,numeric,weight,,,0,,,Weight file',
  "age,Age in completed years,integer,analysis,,-98=Don't know; -99=Refused,0,120,,Person roster",
  'sex,Sex of household member,integer,analysis,1=Male; 2=Female,9=Not stated,,,,Person roster',
  "education_level,Highest education level completed,integer,analysis,0=No schooling; 1=Primary; 2=Lower secondary; 3=Upper secondary; 4=Tertiary,98=Don't know; 99=Refused,,,,Education module",
  "income,Monthly employment income,numeric,analysis,,-98=Don't know; -99=Refused,0,,Only asked if employed,Labour module",
  'employment_status,Current employment status,integer,analysis,1=Employed; 2=Unemployed; 3=Outside labour force,9=Not stated,,,,Labour module',
].join('\n')
