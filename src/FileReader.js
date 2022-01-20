import { useState } from "react";
import './fileReader.css';
export default function CsvReader() {
    const [csvFile, setcsvFile] = useState();
    const [csvArray, setCsvArray] = useState([]);
    const matching = []
    const finalData = []
    const employeePairsData = []

    const proccessCsv = (str, comma = ",") => {
        //proccessing data to arrays from every row 

        let headers = str.slice(0, str.indexOf('\n')).split(comma);
        headers[headers.length - 1] = headers[headers.length - 1].slice(0, -1);
        const rows = str.slice(str.indexOf('\n') + 1).split('\r\n');
        //proccessing the arrays to an array of  key:value pairs objects for every employee
        const newArray = rows.map(row => {

            const value = row.split(comma);
            const object = headers.reduce((keyValue, header, i) => {

                keyValue[header] = value[i]


                return keyValue;
            }, {})
            return object
        })
        findMatchingProject(newArray)
    }
    //main function
    const findMatchingProject = (e) => {
        const arr = []
        e.forEach(element => {
            arr.push(element.ProjectID)
        });
        const duplicates = arr.filter((item, index) => index !== arr.indexOf(item));
        let uniq = [...new Set(duplicates)];

        e.forEach(e => {
            uniq.forEach(a => {
                if (e.ProjectID == a) {
                    matching.push(e)
                }
            })

        })
        //removes duplicate projectID from our data
        duplicates.forEach(e => {
            let sameProj = []
            matching.forEach(a => {
                if (a.ProjectID == e) {
                    sameProj.push(a)
                }
            })
            finalData.push(sameProj)
        })
        finalData.sort(function (a, b) {
            return b.length - a.length;
        });

        //grouping the final data we have to pair employees
        finalData.forEach((e, index) => {

            if (e.length == 2) {

                let data = {}
                data.emp1 = e[0].EmpID
                data.emp2 = e[1].EmpID
                data.projID = e[0].ProjectID
                data.daysWorked = overlap(e[0].DateFrom, e[0].DateTo, e[1].DateFrom, e[1].DateTo)
                if (data.daysWorked > 0) {
                    employeePairsData.push(data)
                }

            } else {
                finalData.splice(index, 1)
                var result = [].concat(...e.map(
                    (v, i) => e.slice(i + 1).map(w => [v, w]))
                );
                let mostDaysTogether = []
                result.forEach((e, index) => {
                    let indexObj = {}
                    indexObj.index = index
                    indexObj.days = overlap(e[0].DateFrom, e[0].DateTo, e[1].DateFrom, e[1].DateTo)
                    mostDaysTogether.push(indexObj)
                })
                let indexOfEmployeeArr = []
                let largest = 0
                let finalPair = {}
                for (let i = 0; i < mostDaysTogether.length; i++) {
                    if (mostDaysTogether[i].days > largest) {
                        largest = mostDaysTogether[i].days;
                        finalPair = result[mostDaysTogether[i].index];
                    }
                }
                finalData.push(finalPair)

            }
        })
        setCsvArray(employeePairsData)
    }
    //checks if employee pairs dates worked on same project overlap
    const overlap = (leftStartTime, leftEndTime, rightStartTime, rightEndTime) => {
        // console.log(leftStartTime, leftEndTime, rightStartTime, rightEndTime);
        leftEndTime = leftEndTime !== 'NULL' || null ? new Date(leftEndTime) : new Date()
        rightEndTime = rightEndTime !== 'NULL' || null ? new Date(rightEndTime) : new Date()
        leftStartTime = new Date(leftStartTime)
        rightStartTime = new Date(rightStartTime)

        let MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000

        if (!(leftStartTime.getTime() <= leftEndTime.getTime() && rightStartTime.getTime() <= rightEndTime.getTime())) {
            console.log('invalid Interval');
        }

        let isOverlapping =
            leftStartTime < rightEndTime && rightStartTime < leftEndTime
        if (!isOverlapping) {

            isOverlapping = rightStartTime < leftEndTime && leftStartTime < rightEndTime
        }

        if (!isOverlapping) {
            return 0
        }

        let overlapStartDate =
            rightStartTime < leftStartTime ? leftStartTime : rightStartTime

        let overlapEndDate = rightEndTime > leftEndTime ? leftEndTime : rightEndTime

        let differenceInMs = new Date(overlapEndDate) - new Date(overlapStartDate)
        return Math.ceil(differenceInMs / MILLISECONDS_IN_DAY)
    }

    const submite = () => {
        const file = csvFile
        const reader = new FileReader()
        reader.onload = (e) => {
            const text = e.target.result
            proccessCsv(text)
        }
        reader.readAsText(file)

    }
    return (
        <form id="csv-form">

            <input
                type='file'
                accept='.csv'
                id='csvFile'
                onChange={(e) => {
                    setcsvFile(e.target.files[0])
                }} ></input>
            <br />
            <button className="button-24"
                onClick={
                    (e) => {
                        e.preventDefault()
                        if (csvFile) { submite() }
                    }
                }
            >Submit</button>
            <br />
            <br />
            <br />
            {csvArray.length > 0 ? <>
                <table style={{ margin: 'auto' }}>
                    <thead>
                        <tr>
                            <th>Employee ID #1</th>
                            <th>Employee ID #2</th>
                            <th>Project ID</th>
                            <th>Days worked together</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            csvArray.map((item, i) => (
                                <tr key={i}>
                                    <td>{item.emp1}</td>
                                    <td>{item.emp2}</td>
                                    <td>{item.projID}</td>
                                    <td>{item.daysWorked}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </> : null}


        </form>
    )
}