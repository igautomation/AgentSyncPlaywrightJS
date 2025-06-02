*** Settings ***
Documentation       Common Abstracted Keywords from libraries

Library             Browser
Library             Process
Library             Collections
Library             String
Library             ${CURDIR}/../python/ScreencastLibrary.py
Variables           ${CURDIR}/../../load_env.py


*** Keywords ***
AS Open Browser
    [Arguments]    ${URL}
    New Browser
    ...    ${BROWSER}
    ...    headless=${HEADLESS}
    ...    args=["--remote-debugging-port=9222", "--disable-background-timer-throttling", "--disable-backgrounding-occluded-windows", "--disable-renderer-backgrounding", "--remote-allow-origins=*"]
    New Page    ${URL}

AS Wait For Elements State
    [Arguments]    ${selector}    ${state}    ${timeout}=120s    ${message}=${None}
    Wait For Elements State    selector=${selector}    state=${state}    timeout=${timeout}    message=${message}

AS Wait For Element State Visible
    [Arguments]    ${selector}    ${timeout}=120s
    AS Wait For Elements State    selector=${selector}    state=visible    timeout=${timeout}

AS Wait For Element State Attached
    [Arguments]    ${selector}    ${timeout}=120s
    AS Wait For Elements State    selector=${selector}    state=attached    timeout=${timeout}

AS Wait For Element State Hidden
    [Arguments]    ${selector}    ${timeout}=120s
    AS Wait For Elements State    selector=${selector}    state=hidden    timeout=${timeout}

AS Get Element Count Equals
    [Arguments]    ${selector}    ${expected_count}
    ${count}=    Get Element Count    ${selector}
    ${counts_match}=    Evaluate    ${count} == ${expected_count}
    RETURN    ${counts_match}

AS Fail If Element Count Is Not Equal
    [Arguments]    ${selector}    ${expected_count}
    ${counts_match}=    AS Get Element Count Equals    ${selector}    ${expected_count}
    IF    not ${counts_match}
        ${element_count}=    AS Get Element Count    ${selector}
        Fail    Expected Count: ${expected_count}, Actual Count: ${element_count}
    END

AS Fail If Element Count Is Not Greater Than Or Equal
    [Arguments]    ${selector}    ${expected_count}
    ${count}=    Get Element Count    ${selector}
    ${is_greater}=    Evaluate    ${count} > ${expected_count}
    ${is_equal}=    Evaluate    ${count} == ${expected_count}
    IF    ${is_greater} or ${is_equal}
        Log    Element count is greater than or equal to ${expected_count}
    ELSE
        Fail    Element count is not greater than ${expected_count}
    END

AS Get Element Count
    [Arguments]    ${selector}    ${timeout}=120s
    ${count}=    Get Element Count    ${selector}
    RETURN    ${count}

AS Go To
    [Arguments]    ${address}    ${timeout}=10s
    Go To    ${address}    timeout=${timeout}

AS Go To With Base URL
    [Arguments]    ${suffix_url}    ${timeout}=120s
    Log    ${GLOBAL_base_url_value}${suffix_url}
    AS Go To    ${GLOBAL_base_url_value}${suffix_url}    timeout=${timeout}    # robotcode: ignore

AS Go To Record By Id
    [Arguments]    ${Id}    ${timeout}=120s
    Go To    ${GLOBAL_base_url_value}/${Id}    timeout=${timeout}    # robotcode: ignore

AS Get Text
    [Arguments]    ${selector}
    ${text}=    Get Text    ${selector}
    RETURN    ${text}

AS Get Text Should Be Equal To Text
    [Arguments]    ${selector}    ${text}
    Get Text    ${selector}    should be    ${text}

AS Get Text Should Contain Text
    [Arguments]    ${selector}    ${text}
    Get Text    ${selector}    contains    ${text}

AS Get Element By Role
    [Arguments]    ${role}    ${name}    ${exact}=true    ${all_elements}=false
    ${locator}=    Get Element By Role    role=${role}    name=${name}    exact=${exact}    all_elements=${all_elements}
    RETURN    ${locator}

AS Get Element By Role Exact
    [Arguments]    ${role}    ${text}    ${exact}=True    ${all_elements}=False    ${timeout}=10s
    [Timeout]    ${timeout}
    ${element}=    Get Element By Role    ${role}    name=${text}    exact=${exact}    all_elements=${all_elements}
    RETURN    ${element}

AS Get All Elements By Role
    [Documentation]    Gets all elements matching a role and name
    [Arguments]    ${role}    ${name}=    ${exact}=false
    ${locator}=    AS Get Element By Role    ${role}    ${name}    exact=${exact}    all_elements=True
    RETURN    ${locator}

AS Get Element By Role InExact
    [Arguments]    ${role}    ${text}
    ${element}=    AS Get Element By Role Exact    role=${role}    text=${text}    exact=False
    RETURN    ${element}

AS Scroll To Element
    [Arguments]    ${selector}
    Scroll To Element    ${selector}

AS Click Element By Role Exact
    [Arguments]    ${role}    ${text}    ${timeout}=10s
    ${element_to_click}=    AS Get Element By Role Exact    ${role}    ${text}    timeout=${timeout}
    AS Wait For Element State Visible    ${element_to_click}    ${timeout}
    Click    ${element_to_click}

AS Click Element By Role InExact
    [Arguments]    ${role}    ${text}    ${timeout}=10s
    ${element_to_click}=    AS Get Element By Role InExact    ${role}    ${text}
    AS Wait For Element State Visible    ${element_to_click}    timeout=${timeout}
    Click    ${element_to_click}

AS Click Button By Name
    [Arguments]    ${button_name}    ${timeout}=10s
    AS Click Element By Role Exact    BUTTON    ${button_name}    timeout=${timeout}

AS Click Link By Name
    [Arguments]    ${link_name}    ${timeout}=10s
    AS Click Element By Role Exact    LINK    ${link_name}    timeout=${timeout}

AS Click Link By InExact Name
    [Arguments]    ${link_name}    ${timeout}=10s
    AS Click Element By Role InExact    LINK    ${link_name}    timeout=${timeout}

AS Click Link By InExact Name With Delay
    [Documentation]    NOT TESTED, Might not work!
    [Arguments]    ${link_name}    ${delay}=5s
    ${link_to_click}=    AS Get Element By Role InExact    LINK    ${link_name}
    Click With Options    ${link_to_click}    delay=${delay}

AS Scroll To Element By Role
    [Arguments]    ${role}    ${text}
    ${element_to_scroll_to}=    AS Get Element By Role Exact    ${role}    ${text}
    AS Scroll To Element    ${element_to_scroll_to}

AS Get Elements
    [Arguments]    ${locator}    ${timeout}=10s
    [Timeout]    ${timeout}
    TRY
        ${elements}=    Get Elements    ${locator}
        RETURN    ${elements}
    EXCEPT
        RETURN    ${EMPTY}
    END

AS Get Element
    [Arguments]    ${locator}    ${timeout}=10s
    [Timeout]    ${timeout}
    TRY
        ${element}=    Get Element    ${locator}
        RETURN    ${element}
    EXCEPT
        RETURN    ${EMPTY}
    END

AS Text Of Element Should Be Equal As Strings
    [Arguments]    ${selector}    ${text}
    ${inner_text}=    Get Text    ${selector}
    Should Be Equal As Strings    ${text}    ${inner_text}

AS Text Of Element Contains Substring
    [Arguments]    ${selector}    ${substring}
    ${inner_text}=    Get Text    ${selector}
    Should Contain    ${inner_text}    ${substring}

AS Get Attribute
    [Arguments]    ${element}    ${selector}
    ${attribute}=    Get Attribute    ${element}    ${selector}
    RETURN    ${attribute}

AS Click
    [Arguments]    ${selector}    ${mouse_button}=left    ${timeout}=120s
    AS Wait For Element State Visible    ${selector}    ${timeout}
    Click    ${selector}    button=${mouse_button}

AS Click With Options
    [Arguments]    ${selector}    ${clickCount}=1    ${force}=False    ${button}=left    ${timeout}=120s
    AS Wait For Element State Visible    ${selector}    timeout=${timeout}
    Click With Options    ${selector}    button=${button}    clickCount=${clickCount}    force=${force}

AS Fill Text
    [Arguments]    ${selector}    ${text}    ${force}=false    ${timeout}=120s
    AS Wait For Element State Visible    ${selector}    timeout=${timeout}
    Fill Text    selector=${selector}    txt=${text}    force=${force}

AS Scroll To Element With Retries
    [Documentation]    This keyword will attempt to scroll to the given selector using three different scroll methods, and retry multiple times.
    [Arguments]    ${selector}    ${max_retries}=${3}    ${retry_interval}=${1}    ${scroll_amount}=${100}
    FOR    ${attempt}    IN RANGE    ${1}    ${${max_retries} + ${1}}
        ${status}=    Run Keyword And Return Status    Scroll To    ${selector}
        IF    ${status}    RETURN    ${TRUE}
        ${status}=    Run Keyword And Return Status    Evaluate JavaScript
        ...    element => element.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'})
        ...    ${selector}
        IF    ${status}    RETURN    ${TRUE}
        ${status}=    Run Keyword And Return Status    AS Scroll Element With Offset    ${selector}    ${scroll_amount}
        IF    ${status}    RETURN    ${TRUE}
        Sleep    ${${retry_interval} + ${attempt}}s
    END
    RETURN    ${FALSE}

AS Scroll Element With Offset
    [Arguments]    ${selector}    ${scroll_amount}=${200}
    ${element_y}=    Evaluate JavaScript    element => element.getBoundingClientRect().top    ${selector}
    ${window_height}=    Evaluate JavaScript    window => window.innerHeight
    ${scroll_y}=    Evaluate    ${element_y} - ${window_height}/${2} + ${scroll_amount}
    Evaluate JavaScript
    ...    (scrollY) => window.scrollBy(0, scrollY)
    ...    ${scroll_y}
    Sleep    1s
    ${new_element_y}=    Evaluate JavaScript    element => element.getBoundingClientRect().top    ${selector}
    ${scrolled}=    Evaluate    abs(${new_element_y} - ${element_y}) > ${scroll_amount}/${2}
    RETURN    ${scrolled}

AS Verify Element Does Not Exist
    [Arguments]    ${locator}
    ${elements}=    Get Elements    ${locator}
    Should Be Empty    ${elements}    No elements should be found with locator ${locator}

AS Verify Element Exists
    [Arguments]    ${locator}
    ${elements}=    Get Elements    ${locator}
    Should Not Be Empty    ${elements}    At least one element should be found with locator ${locator}

AS Verify Image Src Matches Exact Text
    [Arguments]    ${locator}    ${expected_src}
    ${elements}=    Get Elements    ${locator}
    ${element}=    Get From List    ${elements}    0
    ${src}=    Get Attribute    ${element}    src
    Should Be Equal    ${src}    ${expected_src}

AS Verify Image Src Contains Text
    [Arguments]    ${locator}    ${expected_substring}
    ${elements}=    Get Elements    ${locator}
    ${element}=    Get From List    ${elements}    0
    ${src}=    Get Attribute    ${element}    src
    Should Contain    ${src}    ${expected_substring}

AS Wait For Image Src To Change Verify It Contains Substring
    [Documentation]    Verify the src contains substring
    [Arguments]    ${locator}    ${expected_substring}    ${timeout}=10
    ${start_time}=    Get Time
    ${elements}=    Get Elements    ${locator}
    ${element}=    Get From List    ${elements}    0
    FOR    ${i}    IN RANGE    ${timeout}
        ${src}=    Get Attribute    ${element}    src
        IF    '${expected_substring}' in '${src}'    RETURN
        Sleep    1
    END
    ${elapsed_time}=    Evaluate    time.time() - ${start_time}
    Fail    The src attribute did not contain ${expected_substring} within ${timeout} (elapsed: ${elapsed_time})

AS Wait Until Condition Met
    [Documentation]    Generic wait keyword that waits for the completion of a condition keyword. Max retries should be equal to or less than 10.
    [Arguments]    ${condition_keyword}    ${retry_interval}=1s    ${max_retries}=10    ${initial_wait}=0s    &{kwargs}

    Should Be True    ${max_retries} <= 10    Max retries should be less than or equal to 10

    # Adding initial wait as optional wait time
    Sleep    ${initial_wait}

    ${counter}=    Set Variable    0
    WHILE    ${counter} < ${max_retries}
        ${result}=    Run Keyword And Return Status    ${condition_keyword}    &{kwargs}

        # If the condition keyword completes successfully, log the result and exit the loop
        IF    '${result}' == 'PASS' or '${result}' == 'True'
            Log To Console    "Condition met: ${result}"
        END
        IF    '${result}' == 'PASS' or '${result}' == 'True'    RETURN

        Log To Console    "Condition not met. Retrying... (${counter}/${max_retries})"
        ${counter}=    Evaluate    ${counter} + 1
        Sleep    ${retry_interval}

        # Separate the numeric and non-numeric parts (assuming the suffix is always at the end)
        ${numeric_interval}=    Evaluate    ''.join([c for c in str("${retry_interval}") if c.isdigit()])
        ${unit}=    Evaluate    ''.join([c for c in str("${retry_interval}") if not c.isdigit()])

        # Add the counter to the numeric part
        ${numeric_interval}=    Evaluate    int(${numeric_interval}) + ${counter}

        # Append the original non-numeric part back to the result
        ${retry_interval}=    Set Variable    ${numeric_interval}${unit}
    END

    Fail    "Condition was not met within ${max_retries} retries."

AS Set Checkbox
    [Documentation]    Sets the value of a checkbox accepts true or false
    [Arguments]    ${checkbox_selector}    ${checkbox_value}
    IF    ${checkbox_value} is True
        Check Checkbox    ${checkbox_selector}
    ELSE
        Uncheck Checkbox    ${checkbox_selector}
    END

AS Catenate
    [Documentation]    Catenates two strings together, seperator is optional
    [Arguments]    ${string1}    ${string2}    ${Seperator}=${EMPTY}
    ${catenated_string}=    Catenate    SEPARATOR=${Seperator}    ${string1}    ${string2}
    RETURN    ${catenated_string}

Start Recording
    [Documentation]    Keyword that stops the recording of the test case
    IF    "${RECORD_TESTS}" == "true"
        Check For FFMPEG
        Start Screencast
    ELSE
        Log To Console    message=Recording is disabled
    END

Stop Recording
    [Documentation]    Keyword that stops the recording of the test case
    IF    "${RECORD_TESTS}" == "true"
        ${test_name_underscore}=    Replace String    ${TEST NAME}    ${SPACE}    _
        Stop Screencast
        Create Video    output_video=${test_name_underscore}.mp4
    ELSE
        Log To Console    message=Recording is disabled
    END

AS Convert To String
    [Arguments]    ${value}
    ${string_value}=    Convert To String    ${value}
    RETURN    ${string_value}

AS Hover
    [Arguments]    ${selector}
    ${elements}=    Get Elements    ${selector}
    ${element}=    Get From List    ${elements}    0
    Hover    ${element}

AS Should Be Equal
    [Arguments]    ${actual}    ${expected}
    Should Be Equal    ${actual}    ${expected}    Actual: ${actual}, Expected: ${expected}
