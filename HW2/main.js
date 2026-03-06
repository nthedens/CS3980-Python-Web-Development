(function () {
   
   
   //API_URL and html table 
   const API_URL='https://api.datausa.io/tesseract/data.jsonrecords?cube=acs_yg_total_population_5&measures=Population&drilldowns=Year';
   const container = document.getElementById('table-container');
   async function fetchPopulation() {
    try {
        const response =  await fetch(API_URL);
        //check response
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const jsonPopData= await response.json();
        const PopDataArray= jsonPopData.data;

        //Sort data by year
        PopDataArray.sort((a,b)=>b.Year-a.Year);
        
        // Build the table 
        
        let tableHTML = `
            <table class="population-table">
                <thead>
                     <tr>
                         <th>Year</th>
                        <th>Population</th>
                    </tr>
                </thead>
                <tbody>
        `;
      // loop through and format data to table
    for (let i =0; i<PopDataArray.length;i++){
        let yearVal = PopDataArray[i].Year;
        let populationVal = PopDataArray[i].Population.toLocaleString();
        tableHTML += `
        <tr>
            <td>${yearVal}</td>
            <td>${populationVal}</td>
        </tr>
        `;
    }
       // close table
    tableHTML += `
            </tbody>
        </table>
        `;
       // insert into webpage
    container.innerHTML= tableHTML;
       //print errors
    } catch (error) {
        console.error(error);
        container.innerHTML ='<p style ="color:red">Data failed to load.</p>';
    }
   }
   fetchPopulation();
}
)();
