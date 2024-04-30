import GHG_Emissions from "../models/GHG_Emissions";

async function getNewestReportingYear() {
    const newestYear = await GHG_Emissions.findOne().sort('-reportingYear');
    return newestYear?.reportingYear;
}

// 9
export const getTotalEmissionsForCountries = async () => {
    try {
        const newestReportingYear = await getNewestReportingYear();
        
        const countries = await GHG_Emissions.aggregate([
            {
                $match: { reportingYear: newestReportingYear },
            },
            {
                $lookup: {
                    from: 'organisations',
                    localField: 'organisation_id',
                    foreignField: '_id',
                    as: 'organisation',
                },
            },
            {
                $lookup: {
                    from: 'countries',
                    localField: 'organisation.country_id',
                    foreignField: '_id',
                    as: 'country',
                },
            },
            {
                $group: {
                  _id: '$country._id',
                  name: { $first: '$country.name' },
                  TotalEmissions: { $sum: '$totalCityWideEmissionsCO2' },
                },
            },
            {
                $unwind: '$_id', // helps to remove square brackets [] from field name
            },
            {
                $unwind: '$name',
            },
            {
                $sort: {name: 1},
            }
        ])
     
    return countries;    
    } catch (errror) {
        console.log("Error:", errror);
        throw errror;
    }
}