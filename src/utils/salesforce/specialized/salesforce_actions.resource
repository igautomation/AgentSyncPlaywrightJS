*** Settings ***
Documentation       Salesforce specifc actions that can be reused

Library             RequestsLibrary
Library             Browser
Library             OperatingSystem
Library             String
Library             ${CURDIR}/../python/SalesforceLibrary.py
Resource            library_common_abstraction.resource

*** Variables ***
${spinner_locator}                  //lightning-spinner
${METADATA_IMPORT_EXPORT_PAGE}      /lightning/n/agentsync__Metadata_Import_Export
${PACKAGE_QA_GWBRS_CSV}             ${CURDIR}/../../../../scripts/org_gwbr_sync/package_qa_gw_biz_rules/Package QA GW Biz Rules.csv
${ACTIVE_STATUS}                    Active
${SAVE_AND_EDIT_BUTTON}             //button[@name='SaveEdit']
${CSV_IMPORT}                       /lightning/n/agentsync__Agent_CSV_Import
${NEW_CONTACT_BUTTON}               //li[@data-target-selection-name='sfdc:StandardButton.Contact.NewContact']
${LAST_NAME_INPUT_FIELD}            //input[@name='lastName']
${NPN_INPUT_FIELD}                  //input[@name='agentsync__NPN__c']
${NAME_INPUT_FIELD}                 //input[@name='Name']
${RELATED_ACCOUNT_INPUT_FIELD}      //input[@class="slds-combobox__input slds-input" and @placeholder="Search Accounts..."]
${SAVE_EDIT_BUTTON}                 //button[@name='SaveEdit']
${NEW_ACCOUNT_BUTTON}               //li[@data-target-selection-name='sfdc:StandardButton.Account.New']
${CONTACTS_LIST}                    /lightning/o/Contact/list?filterName=__Recent

# LOCATORS FOR User Edit PAGE
${MANAGE_USERS_URL}                 /lightning/setup/ManageUsers/home
${TARGET_USER_LINK}                 iframe >>> //a[normalize-space()='{LastName}, {FirstName}']
${USER_EDIT_BUTTON}                 iframe >>> //td[@id='topButtonRow']//input[@title='Edit']
${USER_ACTIVE_CHECKBOX}             iframe >>> //input[@id='active']
${USER_NPN_INPUT_FIELD}             iframe >>> //label[text()='NPN']/parent::td/following-sibling::td/input
${USER_USERNAME_INPUT_FIELD}        iframe >>> //input[@id='Username']
${USER_SAVE_BUTTON}                 iframe >>> //div[@class='pbHeader']//input[@name='save']
${USER_FIRST_NAME_FIELD}            iframe >>> //input[@id="name_firstName"]
${USER_LAST_NAME_FIELD}             iframe >>> //input[@id="name_lastName"]
${USER_EMAIL_FIELD}                 iframe >>> //input[@id="Email"]
${USER_NEW_BUTTON}                  iframe >>> //div[@class='pbHeader']//input[@name='new']
${USER_LICENSE_ID_FIELD}            iframe >>> (//select[@name='user_license_id'])
${USER_PROFILE_FIELD}               iframe >>> (//label[@for='Profile'])
${USER_PROFILE_SELECTION}           iframe >>> //select[@name='Profile']
${USER_DEACTIVATION_OK_BUTTON}      iframe >>> //input[@id='simpleDialog0button0']

${GWBR_COMBOBOX}                    //agentsync-metadata-import-export//lightning-combobox//button[@name="metadata"]
${GWBR_COMBOBOX_DATA_VALUE}         //agentsync-metadata-import-export//lightning-base-combobox-item[@data-value="{DATA-VALUE}"]

# LOCATORS For APP Change
${APP_AGENTSYNC_TITLE}              //span[@title='AgentSync']
${APP_CHANGE_WAFFLE_ICON}           //div[@class='slds-icon-waffle']
${SEARCH_APP_ITEMS_PLACEHOLDER}     //input[@placeholder='Search apps and items...']
${APP_OPTIONS_LABEL}                a[role='option'][data-label='{App_Name}']
${APP_TITLE_LABEL}                  //span[@class='slds-truncate' and @title='{App_Name}']


*** Keywords ***
AS Login And Open Salesforce
    [Documentation]    Login and Open Salesforce also populates Variables vars that are org specific
    ${result}=    Run    SF_JSON_TO_STDOUT=true sf org open --target-org ${ORG_ALIAS} --path lightning --url-only --json 2> /dev/null
    ${is_dict}=    Evaluate    isinstance(${result}, dict)
    ${url}=    Evaluate    ${result}\["result"]\["url"]
    AS Open Browser    ${url}
    AS Wait For Element State Visible    //div[@class='slds-icon-waffle']
    RETURN    ${url}

AS Populate Org Specific Details
    [Documentation]    This command gets all org details and populates Variables.yaml vars used in various
    ${result}=    Run    SF_JSON_TO_STDOUT=true sf force org display -u ${ORG_ALIAS} --verbose --json 2> /dev/null
    ${is_dict}=    Evaluate    isinstance(${result}, dict)
    ${GLOBAL_base_url_value}=    Evaluate    ${result}\["result"]\["instanceUrl"]
    ${GLOBAL_access_token}=    Evaluate    ${result}\["result"]\["accessToken"]
    Set Global Variable    ${GLOBAL_base_url_value}
    Set Global Variable    ${GLOBAL_access_token}

AS Get Latest Field History Record
    [Documentation]    Get Field History Record from Object
    [Arguments]    ${object_name}    ${field}
    ${query}=    Set Variable
    ...    SELECT Field, NewValue, OldValue FROM ${object_name}__history WHERE Field = '${field}' ORDER BY CreatedDate DESC LIMIT 1
    ${records}=    AS Execute SOQL Query And Return Records    ${query}
    ${field_history_record}=    Set Variable    ${NONE}
    IF    ${records}
        ${field_history_record}=    Set Variable    ${records}[0]
    END
    RETURN    ${field_history_record}

AS Deploy Metadata File To Org
    [Arguments]    ${path_to_metadata}
    ${result}=    Run Process    sf    project:start:deploy    -d    ${path_to_metadata}    -o    ${ORG_ALIAS}    -c    cwd=${CURDIR}
    Log    Command Output:\n${result.stdout}
    Log    Command Error:\n${result.stderr}
    Should Be Equal As Strings    ${result.rc}    0
    RETURN    ${result}

AS Run Anon Apex
    [Arguments]    ${path_to_anon_apex}    ${cwd}
    ${result}=    Run Process    sf    apex:run    -f    ${path_to_anon_apex}    -o    ${ORG_ALIAS}    cwd=${cwd}    timeout=200
    Log    Command Output:\n${result.stdout}
    Log    Command Error:\n${result.stderr}
    Should Be Equal As Strings    ${result.rc}    0
    RETURN    ${result}

AS Execute SOQL Query
    [Arguments]    ${query}    ${use_tooling_api}=${FALSE}
    IF    '${use_tooling_api}' == '${TRUE}'
        ${result}=    Run Process    sf    data:query    -q    ${query}    -o    ${ORG_ALIAS}    -t    --json
    ELSE
        ${result}=    Run Process    sf    data:query    -q    ${query}    -o    ${ORG_ALIAS}    --json
    END
    Should Be Equal As Strings    ${result.rc}    0    msg=Query failed to execute: ${result.stdout}
    RETURN    ${result.stdout}

AS Wait For Query Data
    [Arguments]    ${query}    ${expected_record_size}    ${max_retries}=10
    AS Wait Until Condition Met
    ...    condition_keyword=AS Execute SOQL Query And Verify Record Size
    ...    retry_interval=5s
    ...    initial_wait=10s
    ...    max_retries=${max_retries}
    ...    query=${query}
    ...    expected_record_size=${expected_record_size}

AS Execute SOQL Query And Verify Record Size
    [Arguments]    ${query}    ${expected_record_size}
    ${size}=    AS Execute SOQL Query And Return TotalSize    ${query}
    Should Be Equal As Integers    ${size}    ${expected_record_size}

AS Execute SOQL Query And Return Records
    [Arguments]    ${query}    ${use_tooling_api}=${FALSE}
    ${json_string}=    AS Execute SOQL Query    ${query}    ${use_tooling_api}
    ${ formatted_result}=    Replace String    ${json_string}    \n    ${EMPTY}
    ${ formatted_result}=    Replace String    ${ formatted_result}    \'    ${EMPTY}
    ${ formatted_result}=    Replace String    ${ formatted_result}    \\n    ${EMPTY}
    ${ formatted_result}=    Replace String    ${ formatted_result}    \\"    '
    ${json}=    Evaluate    json.loads('''${formatted_result}''')    json
    ${result}=    Get From Dictionary    ${json}    result
    ${records}=    Get From Dictionary    ${result}    records
    RETURN    ${records}

AS Execute SOQL Query And Return TotalSize
    [Arguments]    ${query}
    ${json_string}=    AS Execute SOQL Query    ${query}
    ${formatted_result}=    Replace String    ${json_string}    \n    ${EMPTY}
    ${formatted_result}=    Replace String    ${formatted_result}    \'    ${EMPTY}
    ${formatted_result}=    Replace String    ${formatted_result}    .\\n    ${SPACE}
    ${formatted_result}=    Replace String    ${formatted_result}    .\n    ${SPACE}
    ${formatted_result}=    Replace String    ${formatted_result}    \\"    '
    ${json}=    Evaluate    json.loads('''${formatted_result}''')    json
    ${result}=    Get From Dictionary    ${json}    result
    ${size}=    Get From Dictionary    ${result}    totalSize
    RETURN    ${size}

AS Validate Deployment Status
    ${records}=    AS Execute SOQL Query And Return Records
    ...    Select Id, Status FROM DeployRequest Order By StartDate DESC LIMIT 1
    ...    ${TRUE}
    ${record}=    Get From List    ${records}    0
    ${status}=    Get From Dictionary    ${record}    Status
    IF    '${status}' != "Succeeded"    Fail

AS Update Salesforce Record
    [Arguments]    ${sobject_type}    ${values}    ${where_clause}=${NONE}    ${record_id}=${NONE}
    IF    '''${where_clause}''' != '${NONE}'
        ${result}=    Run Process
        ...    sf
        ...    data:update:record
        ...    -o
        ...    ${ORG_ALIAS}
        ...    -s
        ...    ${sobject_type}
        ...    -w
        ...    ${where_clause}
        ...    -v
        ...    ${values}
        ...    --json
    ELSE
        ${result}=    Run Process
        ...    sf
        ...    data:update:record
        ...    -o
        ...    ${ORG_ALIAS}
        ...    -s
        ...    ${sobject_type}
        ...    -i
        ...    ${record_id}
        ...    -v
        ...    ${values}
        ...    --json
    END
    Should Be Equal As Strings    ${result.rc}    0

AS Wait For Success Toast
    [Arguments]    ${timeout}=2s
    ${toast_locator}=    Set Variable    //div[@data-key="success"]
    Run Keyword And Ignore Error    AS Wait For Element State Visible    ${toast_locator}    timeout=${timeout}
    ${toast_count}=    Get Element Count    ${toast_locator}
    RETURN    ${toast_count}

AS Wait For Info Toast
    [Arguments]    ${timeout}=2s
    ${toast_locator}=    Set Variable    //div[@data-key="info"]
    Run Keyword And Ignore Error    AS Wait For Element State Visible    ${toast_locator}    timeout=${timeout}
    ${toast_count}=    Get Element Count    ${toast_locator}
    RETURN    ${toast_count}

AS Wait For Error Toast
    [Arguments]    ${timeout}=2s
    ${toast_locator}=    Set Variable    //div[@data-key="error"]
    Run Keyword And Ignore Error    AS Wait For Element State Visible    ${toast_locator}    timeout=${timeout}
    ${toast_count}=    Get Element Count    ${toast_locator}
    RETURN    ${toast_count}

AS Element Exists On Page
    [Arguments]    ${locator}
    [Timeout]    1s
    ${element_states}=    Get Element Count    ${locator}
    IF    ${element_states > 0}
        RETURN    ${True}
    ELSE
        RETURN    ${False}
    END

AS Wait For Spinner Show And Hide
    ${visible_spinner}=    AS Element Exists On Page    ${spinner_locator}
    IF    ${visible_spinner}
        Run Keyword And Ignore Error    AS Wait For Element State Visible    ${spinner_locator}
    END
    Run Keyword And Ignore Error    AS Wait For Element State Hidden    ${spinner_locator}

AS Click All Elements On A Page
    [Documentation]    Functions by clicking the first element found - re-searching for the elements, then clicking the first one found - until complete. Clicking an element can change the state of the overall page and thus can confuse the robot framework.
    [Arguments]    ${locator}
    ${elements_are_on_page}=    AS Element Exists On Page    ${locator}
    IF    ${elements_are_on_page}
        ${all_elements_on_page}=    AS Get Elements    ${locator}    timeout=1s
        WHILE    ${elements_are_on_page}
            AS Click    ${all_elements_on_page}[0]
            ${elements_are_on_page}=    AS Element Exists On Page    ${locator}
            IF    ${elements_are_on_page}
                ${all_elements_on_page}=    AS Get Elements    ${locator}    timeout=1s
            END
        END
    END

AS Fill Text Of All Elements On A Page
    [Documentation]    Functions by clicking the first element found - re-searching for the elements, then clicking the first one found - until complete. Clicking an element can change the state of the overall page and thus can confuse the robot framework.
    [Arguments]    ${locator}    ${text}
    ${elements_are_on_page}=    AS Element Exists On Page    ${locator}
    IF    ${elements_are_on_page}
        ${all_elements_on_page}=    AS Get Elements    ${locator}
        FOR    ${fill_text}    IN    @{all_elements_on_page}
            AS Fill Text    ${all_elements_on_page}[0]    ${text}
        END
    END

AS Get Apex Job Status
    [Documentation]    Gets The Latest Apex Job Status
    ${apex_job_status}=    Get Job Status
    RETURN    ${apex_job_status}

AS Wait For Apex Jobs To Complete
    [Documentation]    Wait for all apex jobs to be completed
    [Arguments]    ${timeout}=400
    Sleep    5
    FOR    ${i}    IN RANGE    ${timeout}
        ${status}=    AS Get Apex Job Status
        IF    'Completed' in '${status}'    RETURN
        Sleep    10
    END
    Fail    The apex job status is ${status} status and was not found completed within ${timeout} timeout

AS Wait For Producer Detail To Exist
    [Documentation]    Verify specific agent id exists
    # TODO we will be replacing this timeout to a custom keyword once it's implemented
    [Arguments]    ${npn}    ${timeout}=100
    ${start_time}=    Get Time
    FOR    ${i}    IN RANGE    ${timeout}
        ${status}=    Wait For Producer Detail To Exist    ${npn}
        IF    ${True} == ${status}    RETURN
        Sleep    1
    END
    ${elapsed_time}=    Evaluate    time.time() - ${start_time}
    Fail    The producer detail record was not found within ${timeout} (elapsed: ${elapsed_time})

AS Wait For Record To Exist By Name
    [Documentation]    Verify specific record exists by name
    [Arguments]    ${obj_name}    ${record_name}    ${timeout}=100
    ${start_time}=    Get Time
    FOR    ${i}    IN RANGE    ${timeout}
        ${status}=    Wait For Record To Exist    ${obj_name}    ${record_name}
        IF    ${True} == ${status}    RETURN
        Sleep    1
    END
    ${elapsed_time}=    Evaluate    time.time() - ${start_time}
    Fail    The Object Record ${record_name} and was not found within ${timeout} (elapsed: ${elapsed_time})

AS Get Appointments Related List Size
    [Documentation]    Retrieves the number of appointments associated with a given NPN
    [Arguments]    ${npn}
    ${appointments_list_size}=    AS Execute SOQL Query And Return TotalSize
    ...    SELECT Id FROM agentsync__Carrier_Appointment__c WHERE agentsync__NPN__c = '${npn}' ORDER BY CreatedDate DESC
    RETURN    ${appointments_list_size}

AS Get Licenses Related List Size
    [Documentation]    Retrieves the number of licenses associated with a given NPN
    [Arguments]    ${npn}
    ${licenses_list_size}=    AS Execute SOQL Query And Return TotalSize
    ...    SELECT Id FROM agentsync__License__c WHERE agentsync__NPN__c = '${npn}' ORDER BY CreatedDate DESC
    RETURN    ${licenses_list_size}

AS Create Contact Record With Related Account
    [Arguments]    ${last_name}    ${npn}    ${related_account}
    AS Go To With Base URL    ${CONTACTS_LIST}    2s
    AS Click    ${NEW_CONTACT_BUTTON}
    AS Fill Text    ${LAST_NAME_INPUT_FIELD}    ${last_name}
    AS Fill Text    ${NPN_INPUT_FIELD}    ${npn}
    AS Click    ${RELATED_ACCOUNT_INPUT_FIELD}
    AS Fill Text    ${RELATED_ACCOUNT_INPUT_FIELD}    ${related_account}
    AS Click    //input[@data-value="${related_account}"]
    AS Click    //lightning-base-combobox-formatted-text[@title="${related_account}"]
    AS Click    ${SAVE_EDIT_BUTTON}

AS Create Account Record
    [Arguments]    ${account_name}    ${npn}
    AS Go To WIth Base URL    /lightning/o/Account/list?filterName=__Recent    2s
    AS Click    ${NEW_ACCOUNT_BUTTON}
    AS Fill Text    ${NAME_INPUT_FIELD}    ${account_name}
    AS Fill Text    ${NPN_INPUT_FIELD}    ${npn}
    AS Click    ${SAVE_EDIT_BUTTON}

AS Create User Record
    [Arguments]    ${target_user}
    AS Go To With Base URL    /lightning/setup/ManageUsers/home
    AS Wait For Element State Visible    iframe >>> //div[@class='pbHeader']//input[@name='new']
    AS Click    iframe >>> //div[@class='pbHeader']//input[@name='new']
    AS Wait For Element State Visible    iframe >>> //input[@id="name_firstName"]
    AS Fill Text    iframe >>> //input[@id="name_firstName"]    ${target_user}[FirstName]
    AS Fill Text    iframe >>> //input[@id="name_lastName"]    ${target_user}[LastName]
    AS Fill Text    iframe >>> //input[@id="Email"]    ${target_user}[Email]
    AS Click    iframe >>> //input[@id='Username']
    AS Fill Text    iframe >>> //label[text()='NPN']/parent::td/following-sibling::td/input    ${target_user}[NPN]
    AS Click    iframe >>> //div[@class='pbHeader']//input[@name='save']

Deactivate User Record By Removing NPN And Updating Username
    [Documentation]    Deactivate User by removing NPN, unselecting the Active checkbox and update username to be unique
    [Arguments]    ${target_user}    ${invalid_username}

    AS Go To With Base URL    ${MANAGE_USERS_URL}
    ${formatted_link}=    Format String
    ...    ${TARGET_USER_LINK}
    ...    LastName=${target_user}[LastName]
    ...    FirstName=${target_user}[FirstName]
    AS Click    ${formatted_link}
    AS Click    ${USER_EDIT_BUTTON}
    AS Fill Text    ${USER_NPN_INPUT_FIELD}    ${EMPTY}
    AS Fill Text    ${USER_USERNAME_INPUT_FIELD}    ${invalid_username}
    AS Click    ${USER_ACTIVE_CHECKBOX}
    AS Click    ${USER_DEACTIVATION_OK_BUTTON}
    AS Click    ${USER_SAVE_BUTTON}

Select All MultiSelect Picklist Items
    [Arguments]    ${picklist_list}
    FOR    ${picklist_item}    IN    @{picklist_list}
        Select MultiSelect Picklist Item    keyword=${picklist_item}
    END

Select MultiSelect Picklist Item
    [Documentation]    Selects a MultiSelect Picklist Item - this is also called a dueling-list in Salesforce
    [Arguments]    ${keyword}
    ${picklist_element}=    AS Get Element By Role Exact    OPTION    ${keyword}
    AS Click    ${picklist_element}
    Keyboard Key    press    Tab
    Keyboard Key    press    Space

DeSelect All MultiSelect Picklist Items
    [Arguments]    ${picklist_list}
    FOR    ${picklist_item}    IN    @{picklist_list}
        DeSelect MutliSelect Picklist Item    keyword=${picklist_item}
    END

DeSelect MutliSelect Picklist Item
    [Arguments]    ${keyword}
    ${picklist_element}=    AS Get Element By Role Exact    OPTION    ${keyword}
    AS Click    ${picklist_element}
    Keyboard Key    down    Shift
    Keyboard Key    press    Tab
    Keyboard Key    up    Shift
    Keyboard Key    press    Space

AS Append Record To CSV
    [Documentation]    Add/Write/Update records/rows to CSV File at runtime
    [Arguments]    ${file}    ${record}
    Append To File    ${file}    ${record}

Test Cleanup Try Catch
    TRY
        AS Run Anon Apex    path_to_anon_apex=userTestCleanup.apex    cwd=${CURDIR}/../../tests/UI/users/apex
        AS Run Anon Apex    path_to_anon_apex=producerTestCleanup.apex    cwd=${CURDIR}/../apex
    EXCEPT
        Fail    msg=Test Cleanup failed
    END

Test Cleanup
    AS Wait Until Condition Met    condition_keyword=Test Cleanup Try Catch    retry_interval=5s

Bulk Post Test Cleanup
    [Arguments]    ${delete_companies}=${FALSE}
    Bulk Post Test Cleanup Python    delete_companies=${delete_companies}
    AS Go To With Base URL    /lightning/o/DeleteEvent/home
    AS Click    div[title="Empty Org Recycle Bin"]
    AS Click    button[title="Empty"]

AS Create Salesforce Session
    [Arguments]    ${session_name}    ${file_path}    ${endpoint}
    Create Session    crs    ${GLOBAL_base_url_value}    verify=False    # robotcode: ignore
    ${headers}=    Create Dictionary
    ...    Accept=application/json
    ...    Content-Type=application/json
    ...    Authorization=Bearer ${GLOBAL_access_token}    # robotcode: ignore
    ${body}=    Get File    ${file_path}
    ${response}=    POST On Session
    ...    crs
    ...    ${endpoint}
    ...    headers=${headers}
    ...    data=${body}
    ...    expected_status=any

    Should Be Equal As Strings    ${response.status_code}    201
    # Sleep is needed because the job is asynchronous and needs time to complete
    Sleep    10s

# Updates gateway business rules based on the passed in csv
# this should only be used in the install prod org setup using the default csv
# after test case is done running, be sure to call this function again with the default file_path

AS Update GWBR
    [Arguments]    ${file_path}=${PACKAGE_QA_GWBRS_CSV}
    AS Populate Org Specific Details
    AS Login And Open Salesforce
    AS Go To With Base URL    ${METADATA_IMPORT_EXPORT_PAGE}
    AS Wait For Element State Visible    //agentsync-metadata-import-export
    AS Wait For Element State Hidden    ${spinner_locator}
    Select Value From Dropdown With Multiple Retries
    ...    ${GWBR_COMBOBOX}
    ...    value_to_select=agentsync__Gateway_Business_Rule__mdt
    ...    max_retries=3
    ...    combobox_option_selector_by_title=${None}
    ...    combobox_option_selector_by_datavalue=${GWBR_COMBOBOX_DATA_VALUE}
    AS Wait For Element State Visible    //lightning-file-upload
    Upload File By Selector    //input[@name="importMetadata"]    ${file_path}
    AS Wait For Element State Visible    //span[text()="1 of 1 file uploaded"]
    AS Click    //button//span[text()="Done"]
    ${toast_count}=    AS Wait For Info Toast    5s
    Should Be Equal As Strings    ${toast_count}    1
    AS Wait Until Condition Met    condition_keyword=AS Validate Deployment Status    retry_interval=10s    max_retries=6

Select Value From Dropdown
    [Documentation]    Clicks on a dropdown and then selects an element by title
    [Arguments]    ${drop_down_selector}    ${value_to_select}    ${value_xpath_prefix}=${None}
    AS Click    ${drop_down_selector}
    IF    '${value_xpath_prefix}' != '${None}'
        AS Click    ${value_xpath_prefix}[.//span[@title="${value_to_select}"]]
    ELSE
        AS Click    ${value_to_select}
    END

Select Value From Dropdown With Multiple Retries
    [Documentation]    Select value from dropdowns with either title or data-value in xpaths and multiple retries
    [Arguments]
    ...    ${drop_down_selector}
    ...    ${value_to_select}
    ...    ${max_retries}=3
    ...    ${combobox_option_selector_by_title}=${None}
    ...    ${combobox_option_selector_by_datavalue}=${None}

    IF    '${combobox_option_selector_by_title}' != '${None}'
        ${combobox_xpath_by_title}=    Format String    ${combobox_option_selector_by_title}    TITLE=${value_to_select}
    END

    IF    '${combobox_option_selector_by_datavalue}' != '${None}'
        ${combobox_xpath_by_data_value}=    Format String    ${combobox_option_selector_by_datavalue}    DATA-VALUE=${value_to_select}
    END

    ${attempt}=    Set Variable    0
    ${element_selected}=    Set Variable    False
    ${continue_loop}=    Set Variable    True
    ${xpath_by_title_datavalue_not_specified}=    Set Variable    False
    Log    Starting dropdown selection for value: ${value_to_select}
    WHILE    ${continue_loop}
        TRY
            ${attempt}=    Evaluate    ${attempt} + 1
            Log    Attempt ${attempt} to select value: ${value_to_select}

            # Ensure dropdown is clicked open
            Log    Clicking dropdown selector: ${drop_down_selector}
            AS Click    ${drop_down_selector}

            # Check for combobox option by title
            IF    '${combobox_option_selector_by_title}' != '${None}'
                ${status_title}    ${result_title}=    Run Keyword And Ignore Error
                ...    AS Wait For Element State Visible
                ...    ${combobox_xpath_by_title}    timeout=1s
                Log    Status for title: ${status_title}
                IF    '${status_title}' == 'PASS'
                    AS Click    ${combobox_xpath_by_title}
                    Log    Successfully clicked element with title: ${value_to_select}
                    ${element_selected}=    Set Variable    True
                END
            END
            # Check for combobox option by data-value
            IF    '${combobox_option_selector_by_datavalue}' != '${None}'
                ${status_data_value}    ${result_data_value}=    Run Keyword And Ignore Error
                ...    AS Wait For Element State Visible
                ...    ${combobox_xpath_by_data_value}    timeout=1s
                Log    Status for data-value: ${status_data_value}
                IF    '${status_data_value}' == 'PASS'
                    AS Click    ${combobox_xpath_by_data_value}
                    Log    Successfully clicked element with data-value: ${value_to_select}
                    ${element_selected}=    Set Variable    True
                END
            END
            ${xpath_by_title_datavalue_not_specified}=    Evaluate
            ...    '${combobox_option_selector_by_title}' == '${None}' and '${combobox_option_selector_by_datavalue}' == '${None}'
            IF    ${xpath_by_title_datavalue_not_specified}
                ${status_data_value}    ${result_data_value}=    Run Keyword And Ignore Error
                ...    AS Wait For Element State Visible
                ...    ${value_to_select}    timeout=1s
                Log    Status for data-value: ${status_data_value}
                IF    '${status_data_value}' == 'PASS'
                    AS Click    ${value_to_select}
                    Log    Successfully clicked element with xpath: ${value_to_select}
                    ${element_selected}=    Set Variable    True
                END
                AS Click    ${value_to_select}
            END

            ${continue_loop}=    Evaluate    ${attempt} < ${max_retries} and not ${element_selected}
        EXCEPT
            Log    Exception occurred during attempt ${attempt}. Retrying...
            ${continue_loop}=    Evaluate    ${attempt} < ${max_retries} and not ${element_selected}
        END
    END

    IF    not ${element_selected}
        Log    Failed to select value: ${value_to_select} after ${max_retries} attempts.
        Fail    Failed to select value "${value_to_select}" after ${max_retries} attempts.
    ELSE
        Log    Successfully selected value: ${value_to_select}
    END

AS Scroll Until Element Is On Page
    [Documentation]    Will Scroll vertically until Element is Visible
    [Arguments]
    ...    ${selector}
    ...    ${vertical_scroll_distance}=300%
    ...    ${number_of_tries}=5
    ...    ${fail_test_on_no_element_found}=True
    ...    ${wait_period_between_scrolling}=1
    ${number_of_attempts}=    Set Variable    0
    Scroll By    vertical=${vertical_scroll_distance}
    Sleep    ${wait_period_between_scrolling}s
    ${is_element_on_page}=    AS Element Exists On Page    ${selector}
    WHILE    ${is_element_on_page} == ${False} and ${number_of_tries} >= ${number_of_attempts}
        Sleep    ${wait_period_between_scrolling}
        Scroll By    vertical=${vertical_scroll_distance}
        ${is_element_on_page}=    AS Element Exists On Page    ${selector}
        ${number_of_attempts}=    Evaluate    ${number_of_attempts} + 1
        ${wait_period_between_scrolling}=    Evaluate    ${number_of_attempts} + ${wait_period_between_scrolling}
    END

    IF    ${is_element_on_page} == ${False} and ${fail_test_on_no_element_found} == ${True}
        Fail    msg="Element Not found using ${selector}"
    END

Change Salesforce App
    [Arguments]    ${app_name}
    ${elements_is_on_page}=    Run Keyword And Return Status    AS Wait For Element State Visible    ${APP_AGENTSYNC_TITLE}
    IF    ${elements_is_on_page} == ${False}
        AS Wait For Element State Visible    ${APP_CHANGE_WAFFLE_ICON}
        AS Click    ${APP_CHANGE_WAFFLE_ICON}
        AS Wait For Element State Visible    ${SEARCH_APP_ITEMS_PLACEHOLDER}
        AS Fill Text    ${SEARCH_APP_ITEMS_PLACEHOLDER}    ${app_name}
        ${formatted_option_lable}=    Format String
        ...    ${APP_OPTIONS_LABEL}
        ...    App_Name=${app_name}
        AS Click    ${formatted_option_lable}
        ${formatted_app_name_lable}=    Format String
        ...    ${APP_TITLE_LABEL}
        ...    App_Name=${app_name}
        AS Wait Until Condition Met
        ...    condition_keyword=AS Wait For Element State Visible
        ...    retry_interval=5
        ...    max_retries=5
        ...    selector= ${formatted_app_name_lable}
    END

AS Query For Transaction For Validation
    [Arguments]    ${transactionId}
    ${queriedTransaction}=    Get Transaction For Validation    ${transactionId}
    RETURN    ${queriedTransaction}

AS Validate Transaction
    [Arguments]    ${queriedTransaction}    ${expectedValueMap}

    @{expectedValueKeys}=    Get Dictionary Keys    ${expectedValueMap}

    FOR    ${key}    IN    @{expectedValueKeys}
        ${expectedValue}=    Get From Dictionary    ${expectedValueMap}    ${key}
        ${actualValue}=    Get From Dictionary    ${queriedTransaction}    ${key}
        Should Be Equal As Strings    ${expectedValue}    ${actualValue}    msg=${queriedTransaction}
    END

AS Get Current Record ID
    [Documentation]    Gets the record Id from the URL
    ${currentURL}=    Get Url
    ${recordId}=    Get Record Id From URL    ${currentURL}
    RETURN    ${recordId}

AS Delete Batch By ID
    [Documentation]    Deletes a NIPR Batch by a given ID
    [Arguments]    ${batchId}
    Delete Batch By ID    ${batchId}

AS Submit Transaction From Batch Page
    [Documentation]    From the Batch page, select the transaction and submit
    AS Wait For Element State Visible
    ...    //label[contains(@class, "slds-checkbox__label") and .//span[text()="Select All"]]//span[1]
    AS Click
    ...    //label[contains(@class, "slds-checkbox__label") and .//span[text()="Select All"]]//span[1]

    AS Wait For Element State Visible    //button[@type="button" and text()="Submit Transactions"]
    AS Click    //button[@type="button" and text()="Submit Transactions"]

    AS Wait For Element State Visible    //button[text()="Submit"]
    AS Click    //button[text()="Submit"]
    ${batchRecordId}=    AS Get Current Record ID
    RETURN    ${batchRecordId}

AS Navigate To Transaction After Submission
    [Documentation]    After submitting a transaction from the batch page, wait for the transaction to finish processing and then navigate to the transaction
    AS Wait For Element State Visible    //span[text()="Submission: Submitted"]    timeout=360s
    AS Wait For Element State Visible    //a[contains(text(), "GT")]
    ${transactionURL}=    Get Attribute    //a[contains(text(), "GT")]    href
    AS Go To With Base URL    ${transactionURL}

AS Poll On Transaction
    [Documentation]    Clicks the poll button on the transaction page
    AS Wait For Element State Visible    //button[@name="agentsync__Gateway_Transaction__c.agentsync__Polling_Request"]
    Click    //button[@name="agentsync__Gateway_Transaction__c.agentsync__Polling_Request"]

    AS Wait For Element State Visible    //button[text()="Close"]
    Click    //button[text()="Close"]

AS Enable Transactor
    [Documentation]    Turns the transactor feature param on

    AS Deploy Metadata File To Org
    ...    ${CURDIR}/../../../../unpackaged/config/enable_transactor/agentsync_transactor_enabled.featureParameterBoolean-meta.xml

AS Disable Transactor
    [Documentation]    Turns the transactor feature param off
    AS Deploy Metadata File To Org
    ...    ${CURDIR}/../../../../unpackaged/config/disable_transactor/agentsync_transactor_enabled.featureParameterBoolean-meta.xml

AS Verify NIPR Tracking Status With Reload
    [Arguments]    ${status}    ${sobject}
    [Timeout]    150s
    ${keyword_status}=    Run Keyword And Return Status
    ...    AS Wait For Element State Visible
    ...    //div[@data-target-selection-name="sfdc:RecordField.${sobject}.agentsync__AgentSync_Tracking__c"]//lightning-formatted-text[text()="${status}"]
    WHILE    ${keyword_status} != ${TRUE}
        Reload
        ${keyword_status}=    Run Keyword And Return Status
        ...    AS Wait For Element State Visible
        ...    //div[@data-target-selection-name="sfdc:RecordField.${sobject}.agentsync__AgentSync_Tracking__c"]//lightning-formatted-text[text()="${status}"]
    END

AS Parse Record Creation Result
    [Arguments]    ${result}
    ${successful_ids}=    Create List
    FOR    ${entry}    IN    @{result}
        IF    ${entry['success']} == True and ${entry['created']} == True
            Append To List    ${successful_ids}    ${entry['id']}
        ELSE
            Log    Unsuccessful transaction: ${entry}
        END
    END
    RETURN    ${successful_ids}
