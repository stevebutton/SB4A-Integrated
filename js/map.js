let currentMarker = -1;
const allMarkers = [];
const toolsMarkers = [];
const legend = document.getElementById('legend');
const info = document.getElementById('marker-info');
legend.style.display = 'none';

const pulsationColor = '#D8D8D8'
const pulsationColorActive = '#70A3D5'

var Webflow = Webflow || [];
Webflow.push(function () {
    $(document).on('slider-event', '#SOP_slider', function (e, data) {
        console.log('SLIDER EVENT');
        checkSliderIndex()
    });
});


$(document).on("click", "#missionreports", function () {
    console.log('missionreports');
    toggleToolsMarkersVisibility()
});


$(document).on("click", "#show_ranking_layer", function () {
    // toggleLayers(['sop-sb4a-quality', 'sop-sb4a-eud', 'sop-sb4a'])
    toggleLayers(['sop-sb4a-quality'])
    pulsationMarkersVisibility(false);
    map.flyTo({
        bearing: -0.03,
        duration: 5000,
        center: [15.63593, -2.02996],
        zoom: 2.06,
        pitch: 45
    });
});

$(document).on("click", "#show_pulsation_markers", function () {
    console.log('show_pulsation_markers');
    toggleLayers()//hide all
    pulsationMarkersVisibility(true);
    map.flyTo({
        bearing: 11,
        duration: 5000,
        center: [15.63593, -2.02996],
        zoom: 2.53,
        pitch: 0
    });
});

$(document).on("click", "#show_sop_layer", function () {
    toggleLayers('sop-sb4a')
    pulsationMarkersVisibility(false);
    checkSliderIndex();
    map.flyTo({
        bearing: 9.60,
        duration: 5000,
        center: { lon: 15.72016, lat: -0.47003 },
        zoom: 2.40,
        pitch: 14
    });
});

function checkSliderIndex() {
    const index = $("#SOP_slider").find(".w-slider-dot.w-active").index();
    if (index >= 1) {
        toggleLayers(['sop-sb4a-eud', 'sop-sb4a'])
    } else {
        toggleLayers(['sop-sb4a'])
    }
    if (index === 1) {
        map.flyTo({
            bearing: 0,
            duration: 5000,
            center: { lon: 22.17730, lat: -5.27871 },
            zoom: 2.49,
            pitch: 42.50
        });
    }
}
function toggleLayers(layerName) { //show, hide, hide all layers without props
    const layers = [
        'sop-sb4a-quality',
        'sop-sb4a-eud',
        'sop-sb4a'
    ]
    const onLayers = layers
        .filter(value => layerName && layerName.includes(value)) //find intersection between two arrays
    layers.forEach(i => {
        const v = (onLayers.includes(i)) ? 'visible' : 'none';
        console.log(`map.setLayoutProperty(${i}, 'visibility', ${v})`);
        map.setLayoutProperty(i, 'visibility', v);
    })
}

map.on("style.load", () => {
    toggleLayers()// hide all layers
})


map.on('load', () => {

    //TOOLS&KNOWLEDGE MARKERS PART
    d3.csv("https://docs.google.com/spreadsheets/d/1fuu3zv0fT_pioYVcDODl7txvKMvQdu9XJv2ayKFPjBU/gviz/tq?tqx=out:csv&sheet=Sheet1", s => {
        console.log('s', s);

        let tempIcon = '';
        s.forEach(function (d, index) {

            if (d['ICON for map'] !== '') {
                tempIcon = d['ICON for map'];
            }

            var div = document.createElement('div');
            div.className = 'toolsmarker ' //+ filterList;
            div.setAttribute("index", index)

            var icon = document.createElement('img');
            icon.src = tempIcon;
            icon.style.width = '40px';
            icon.style.height = '40px';

            // var cName = document.createElement('div');
            // cName.append(document.createTextNode(d['location']))
            // cName.className = 'country-name';
            //div.appendChild(cName);

            div.appendChild(icon);

            //========= main features part ===============

            var coord = [+d['Longitude'], +d['Latitude']]

            new mapboxgl.Marker(div)
                .setLngLat(coord)
                .addTo(map);

            div.addEventListener('click', (e) => {

                const el = e.target.firstChild || e.target.parentNode;
                const id = el.getAttribute("index");

                //remove previuos elements
                document.querySelectorAll(".tools-info").forEach(i => i.remove())

                var div = document.createElement('div');
                div.className = 'tools-info' //+ filterList;
                div.innerHTML = `
                    <img src="${d['banner-image']}">
                    <div style="padding:0px 20px;">
                        <h3>${d['location']}</h3>
                        <h4 style="color:black">${d['author']}</h4>
                        <p style="color:black">${d['title']}</p>
                        <p style="text-align: center;">
                            <img src="${d['link image']}" href="//contentthatmoves.com/mapbox-SB4A_Prototype/${d['link']}" class="pdf_link">
                        </p>
                    </div>
                `
                document.body.appendChild(div);

                var center = coord
                map.flyTo({
                    center: center,
                    speed: 0.6, // make the flying slow
                    zoom: 5
                });

                e.stopPropagation();

            });
            toolsMarkers.push(div)
        })

        toolsMarkersVisibility(false)
    })


    d3.csv("https://docs.google.com/spreadsheets/d/1OvT9KX1_V0oy-4dZYOfli-cf9g0CjeapV9-vSxNriEs/gviz/tq?tqx=out:csv&sheet=Sheet1", s => {

        s.forEach((i, key) => { // remove spaces from object names
            Object.keys(i).forEach(k => {
                const d = k.trim();
                s[key][d] = s[key][k]
                if (d !== k) {
                    delete s[key][k]
                }
            })
        })

        console.log('i', s);
        pins = s.filter(i => i.Name !== "" && i.Latitude !== "").map(d => { // preapare data for charts
            d['Series1'] = d['Series1'].replace(/(\r\n|\n|\r)/gm, "").split(",").filter(i => i !== "" && i !== null).map(i => +i)
            d['Series2'] = d['Series2'].replace(/(\r\n|\n|\r)/gm, "").split(",").filter(i => i !== "" && i !== null).map(i => +i)
            return {
                "type": "Feature",
                "geometry": { "type": "Point", "coordinates": [+d['Longitude'], +d['Latitude']] },
                "properties": {
                    ...d
                },
            }
        })

        s.filter(i => i.Name !== "" && i.Latitude !== "").forEach(function (d, index) {

            var div = document.createElement('div');
            div.className = 'markers ' //+ filterList;
            div.setAttribute("index", index)

            var ringring = document.createElement('div');
            ringring.className = 'ringring';
            var circle = document.createElement('div');
            circle.className = 'circle';
            div.appendChild(ringring);
            div.appendChild(circle);

            //========= main features part ===============
            const mainFeatures = `
            <div class="space-between">PPD established ${getIconByVal(d['PPD established'])}</div>
            <div class="space-between">Involvement of EUD in PPD ${getIconByVal(d['Involvement of EUD in PPD'])}</div>
            <div class="space-between">Presence of EU Chamber of Commerce ${getIconByVal(d['Presence of EU Chamber of Commerce'])}</div>
            <div class="space-between">Presence of MS private sector organization ${getIconByVal(d['Presence of MS private sector organization'])}</div>
            <div class="space-between">Organisation by EUD of outreach activities ${getIconByVal(d['Organisation by EUD of outreach activities'])}</div>
            `
            console.log('main', mainFeatures);
            function getIconByVal(val) {

                let img = 'yes'
                if (+val === 0) {
                    img = 'no'
                }
                return `<img style="width:50px;" title="${img}" src="images/result-${img}.png">`
            }


            var coord = [+d['Longitude'], +d['Latitude']]

            new mapboxgl.Marker(div)
                .setLngLat(coord)
                .addTo(map);

            div.addEventListener('click', (e) => {

                infoDiv(false)

                // info.style.display = 'inherit';
                currentMarker = index;
                // for blue ring
                Array.from(document.querySelectorAll(".ringring")).forEach(i => i.style['border-color'] = pulsationColor)
                var circle = e.target.firstChild || e.target.parentNode.querySelector('.ringring')
                circle.style['border-color'] = pulsationColorActive

                var geo = arguments["0"]
                var center = coord
                map.flyTo({
                    center: center,
                    speed: 0.6, // make the flying slow
                    zoom: 3
                });
                //popupDiv.style.display = "initial";
                legend.innerHTML =
                    `

                    <div>
                        <div style="text-align: center;  float:left;width:350px">

                            <div style="display:flex;justify-content: center;">
                                <div style="text-align: center;  width:30px;cursor:pointer;margin-top: 16px;">
                                    <div id="prev_info"><i class="left arrow"></i></div>
                                </div>
                                <div style="text-align: center;  ">
                                        <h1 style="font-family: Oswald, sans-serif;text-align: center;color:black;padding-top:0px;margin-top:0px;">${d.Name}</h1>
                                </div>
                                <div style="text-align: center; width:30px;cursor:pointer;margin-top: 16px;">
                                    <div id="prev_info"><i class="right arrow"></i></div>
                                </div>
                                <div style="clear:both"></div>
                            </div>
                            <div class="radarChart"></div>

                        </div>
                        <div style="height:410px;overflow-y: overlay;   float:left;width:300px;margin-left:10px;margin-top:49px">
                            <div >
                                ${d.Description}
                            </div>
                            <button class="collapsible">Other main features</button>
                            <div class="content_c">
                                <p>${mainFeatures}</p>
                            </div>
                            <button class="collapsible">Strengths</button>
                            <div class="content_c">
                                <p>${d.Strengths}</p>
                            </div>
                            <button class="collapsible">Weaknesses</button>
                            <div class="content_c">
                                <p>${d.Weaknesses}</p>
                            </div>
                            <button class="collapsible">Opportunities</button>
                            <div class="content_c">
                                <p>${d.Opportunities}</p>
                            </div>
                            <button class="collapsible">Threats</button>
                            <div class="content_c">
                                <p>${d.Threats}</p>
                            </div>
                        </div>
                        <div style="clear:both"></div>
                    </div>

                    `

                var coll = document.getElementsByClassName("collapsible");
                var i;
                for (i = 0; i < coll.length; i++) {
                    coll[i].addEventListener("click", function () {
                        this.classList.toggle("active_map");
                        var content = this.nextElementSibling;
                        if (content.style.maxHeight) {
                            content.style.maxHeight = null;
                        } else {
                            content.style.maxHeight = content.scrollHeight + "px";
                        }
                    });
                }
                legend.style.display = 'inherit';
                e.stopPropagation();
                //conver data to suitable format
                console.log('d', d);
                const chartTitles = [
                    'Effectiveness of PPD',
                    'Government',
                    'Local private sector',
                    'EU private sector',
                    'SMEs',
                    'Large companies',
                    'Micro and informat',
                    'IFIs',
                    'International Organisations',
                    'Local financial sector',
                    'Women',
                    'Young people',
                ]
                const chartData = [
                    d.Series1.map((i, index) => { return { 'axis': chartTitles[index], 'value': i } }),
                    d.Series2.map((i, index) => { return { 'axis': chartTitles[index], 'value': i } })
                ]

                console.log('chartData', chartData);
                buildChart(chartData)
            });
            allMarkers.push(div)
        })
        pulsationMarkersVisibility(false) // hide markes
    })

})

document.addEventListener("click", (e) => { // hide popup on mouse click

    const classClick = e.target.className;
    console.log('classClick', classClick);

    if (classClick === "pdf_link") {
        //open pdf doc
        console.log('open pdf modal', e, e.target);
        openPDF(e.target.getAttribute("href"))
        //openModal(generatePdf(e.target.getAttribute("href")))
        disableWindowScroll()
    }
    if (classClick.includes("close_pdf") || classClick.includes("close-modal")) {

        const pdf = document.querySelector("#pdf")
        pdf.style.display = "none";
        enableWindowScroll()
    }
})

document.addEventListener("click", (e) => { // hide popup on mouse click
    const c = e.target.closest(".tools-info");
    if (c === null) {
        hideToolsMarkersInfoDiv()
    }
})

function generatePdf(url) {
    const link = url;
    const pdfDiv = `<div>
            <object data="${link}" type="application/pdf" style="width:100%;height:80vh">
                alt : <a href="${link}">test.pdf</a>
            </object>
        </div>`;
    return pdfDiv
}


function openModal(content) {
    $(".modal-window .hide-me-overlay").css("display", "block");
    $(".modal-window .hide-me-overlay").fadeTo(500, 1);
    $(".modal-window .w-embed").html(content)
}
function closeModal() {
    $(".modal-window .hide-me-overlay").css("display", "none");
    $(".modal-window .hide-me-overlay").css("opacity", "0");
    $(".modal-window .w-embed").html("")
}
$(document).on('click', '.close-modal', function () {
    //close modal event
});



function openPDF(url) {
    const pdf = document.querySelector("#pdf");
    pdf.style.display = 'inline';
    const link = url;
    console.log('link', link);
    const pdfDiv = `<div>
    <button class="close_pdf" style="    position: absolute;
    /* padding: 10px; */
    margin: 10px;
    height: 30px;
    border-radius: 40px;
    width: 30px;
    font-size: 20px;">×</button>
        <object data="${link}" type="application/pdf" style="width:100%;height:80vh">
            alt : <a href="${link}">test.pdf</a>
        </object>
    </div>`;
    pdf.innerHTML = pdfDiv;

}

var toggleToolsMarkersVisibility = (function () {
    var visible = true;
    return function () {
        toolsMarkersVisibility(visible)
        visible = !visible;
        return visible
    }
})();


function toolsMarkersVisibility(visible) {
    toolsMarkers.forEach(i => {
        i.style.display = visible ? '' : 'none'
    });
}
function hideToolsMarkersInfoDiv() {
    document.querySelectorAll(".tools-info").forEach(i => i.remove())
}

function pulsationMarkersVisibility(visible) {
    allMarkers.forEach(i => {
        i.style.display = visible ? '' : 'none'
        i.querySelector(".ringring").style['border-color'] = pulsationColor //reset pulsation colors
    });
}

function infoDiv(visible) {
    //document.getElementById("stateofplay-info").style.display = visible ? '' : 'none';
    document.getElementById("marker-info").style.display = visible ? 'none' : '';
}

var event = new Event('click');
$(document).on("click", "#next_info", function () {
    console.log('next',);
    prevNext(+1)
});
$(document).on("click", "#prev_info", function () {
    console.log('prev',);
    prevNext(-1)
});


function prevNext(i) {

    currentMarker = currentMarker + i;

    if (currentMarker > allMarkers.length - 1) {
        currentMarker = 0
    } else if (currentMarker < 0) {
        currentMarker = allMarkers.length - 1
    }

    console.log('currentMarker', currentMarker);
    const div = allMarkers.find(i => i.style.display !== 'none' && +i.getAttribute("index") === currentMarker)
    div.dispatchEvent(event)

}


function buildChart(data) {
    /* Radar chart design created by Nadieh Bremer - VisualCinnamon.com */

    //////////////////////////////////////////////////////////////
    //////////////////////// Set-Up //////////////////////////////
    //////////////////////////////////////////////////////////////

    var margin = { top: 30, right: 65, bottom: 30, left: 65 },
        width = Math.min(350, window.innerWidth - 10) - margin.left - margin.right,
        height = Math.min(350, window.innerHeight - margin.top - margin.bottom - 20);


    //////////////////////////////////////////////////////////////
    //////////////////// Draw the Chart //////////////////////////
    //////////////////////////////////////////////////////////////

    var color = d3.scale.ordinal().range(["skyblue", "#FF8C00", "#00A0B0"]);

    var radarChartOptions = {
        w: width,
        h: height,
        margin: margin,
        maxValue: 0.5,
        levels: 5,
        roundStrokes: false,
        color: color
    };
    //Call function to draw the Radar chart
    RadarChart(".radarChart", data, radarChartOptions);
}


var winX = null, winY = null;
window.addEventListener('scroll', function () {
    if (winX !== null && winY !== null) {
        window.scrollTo(winX, winY);
    }
});
function disableWindowScroll() {
    winX = window.scrollX;
    winY = window.scrollY;
};
function enableWindowScroll() {
    winX = null;
    winY = null;
};


function toggleBorderLayer(layerName) { //show, hide, hide all layers without props
    const layers = [
        "cameroon",
        "sop-sb4a",
        "sop-sb4a-quality",
        "sop-sb4a-eud",
        "africa",
        "fragile",
        "madagascar",
        "southafrica",
        "ghana",
        "liberia",
        "eu",
        "uganda",
        "benin",
        "angola",
        "togo",
        "rwanda",
        "DRC",
        "morocco"
    ]
    layers.forEach(i => {
        const v = (layerName && layerName === i) ? 'visible' : 'none';
        console.log(layerName, 'visibility', v);
        map.setLayoutProperty(i, 'visibility', v);
    })
}
