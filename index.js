const header_height = 80;
const header_svg_width = 500;

var width = window.innerWidth;
var height = window.innerHeight - header_height - 5; // -1 because of the <hr> line

var currentPage = 0 // 0=root, 1=projects, 2=about, 3=contact

const header_margin = {
    left: 10,
    right: 0,
    top: 0,
    bottom: 0,
}
const margin = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
};

// HEADER -------------------------------------------
const header = d3.select('#path') //TODO: make just a div, no need for svg

// BODY -------------------------------------------
const svg = d3.select('svg#main')
    .attrs({
        width: width,
        height: height,
    })

function load_root() {
    header.html('/julian');

    const colorScale = d3.scaleSequential(d3.interpolateInferno)

    const pages = [
        {
            name: 'about',
            r: 130,
        },
        {
            name: 'contact',
            r: 100,
        },
        {
            name: 'projects',
            r: 160,
        },
    ]

    const mainNodes = pages.map(d => {
        return {
            name: d.name,
            r: d.r,
            x: (Math.random() * width - width / 2),
            y: (Math.random() * height - height / 2),
            colorHue: Math.random(),
            opacity: 1,
            layer: 0,
        }
    })

    const data = Array.from({ length: 50 }, () => { // randomNodes
        return {
            name: '',
            r: (Math.random()**1.7 * 60 + 10),
            x: (Math.random() * width - width / 2) * 2,
            y: (Math.random() * height - height / 2) * 2,
            colorHue: Math.random(),
            opacity: 0.6,
            layer: 1,
        }
    })
    
    data.push(...mainNodes)

    svg.selectAll('.node').remove()

    svg
        .attrs({
            width: width,
            height: height,
            viewBox: [-width / 2, -height / 2, width, height],
        })

    const nodes = svg.selectAll('.node')
        .data(data).enter()
        .append('g')
        .attr('class', 'node')
        .style('cursor', 'grab')
    nodes
        .append('circle')
        .attrs({
            r: d => d.r,
            fill: d => colorScale(d.colorHue),
        })
        .styles({
            filter: d => `brightness(${d.opacity})`,
        })
    nodes
        .filter(d => d.layer === 0)
        .append('text')
        .text(d => d.name)
        .style("font-size", "1px")
        .each(getSize)
        .styles({
            'font-family': '"Andale Mono", AndaleMono, monospace',
            'font-size': d => d.scale / 1.6 + "px",
            'dominant-baseline': 'middle',
            'text-anchor': 'middle',
            'font-weight': 'bold',
            'fill': d => d.colorHue < 0.8 ? 'white' : 'black'
        })

    nodes.filter(d => d.layer===0).on('click', function (e,d) {
        const name = d.name;
        switch (name) {
            case 'projects':
                currentPage = 1;
                load_projects();
                break;
        
            default:
                break;
        }
    });

    function getSize(d) {
        var bbox = this.getBBox(),
            cbbox = this.parentNode.getBBox(),
            scale = Math.min(cbbox.width / bbox.width, cbbox.height / bbox.height);
        d.scale = scale;
    }

    const sim = d3.forceSimulation(data)
        .force('charge', d3.forceManyBody()
            .strength(-10)
        )
        .force('center', d3.forceCenter())
        .force('collision', d3.forceCollide()
            .radius(d => d.r * 1.1)
            .iterations(2)
        )
        .force('x', d3.forceX(0)
            .strength(d => d.layer == 0 ? 0.1 : 0.03)
        )
        .force('y', d3.forceY(0)
            .strength(d => d.layer == 0 ? 0.1 : 0.03)
        )
        .alphaDecay(0.01)
        .on("tick", ticked);

    function ticked() {
        nodes
            .attr('transform', d => `translate(${d.x} ${d.y})`)
    }

    nodes.call(drag(sim,nodes));
}

function load_projects() {
    header.html('/julian/projects')

    const colorScale = d3.scaleSequential(d3.interpolateInferno)

    const backNode = {
        name: 'go back',
        r: 50,
        layer: -1,
        x: -width / 2 + 70,
        y: -height / 2 + 70,
        colorHue: 0,
        opacity: 1,
    }

    const mainNodes = [
        {
            name: 'project1',
            r:100,
        },
        {
            name: 'project2',
            r:200,
        },
        {
            name: 'project3',
            r:150,
        },
        {
            name: 'project4',
            r:125,
        },
        {
            name: 'project5',
            r:175,
        },
    ]

    const data = mainNodes.map(d => {
        return {
            name: d.name,
            r: d.r,
            x: (Math.random() * width - width / 2),
            y: (Math.random() * height - height / 2),
            colorHue: Math.random(),
            opacity: 1,
            layer: 0,
        }
    })

    data.push(backNode)

    svg.selectAll('.node').remove()

    const nodes = svg.selectAll('.node')
        .data(data).enter()
        .append('g')
        .attr('class', 'node')
        .style('cursor', 'grab')
    nodes
        .append('circle')
        .attrs({
            r: d => d.r,
            fill: d => colorScale(d.colorHue),
        })
        .styles({
            filter: d => `brightness(${d.opacity})`,
        })
    nodes
        .filter(d => d.layer <= 0)
        .append('text')
        .text(d => d.name)
        .style("font-size", "1px")
        .each(getSize)
        .styles({
            'font-family': '"Andale Mono", AndaleMono, monospace',
            'font-size': d => d.scale / 1.6 + "px",
            'dominant-baseline': 'middle',
            'text-anchor': 'middle',
            'font-weight': 'bold',
            'fill': d => d.colorHue < 0.8 ? 'white' : 'black'
        })

    nodes.filter(d => d.layer <= 0).on('click', function (e,d) {
        const name = d.name;
        switch (name) {
            case 'go back':
                currentPage = 0;
                load_root();
                break;
        
            default:
                break;
        }
    });

    function getSize(d) {
        var bbox = this.getBBox(),
            cbbox = this.parentNode.getBBox(),
            scale = Math.min(cbbox.width / bbox.width, cbbox.height / bbox.height);
        d.scale = scale;
    }

    const sim = d3.forceSimulation(data)
        .force('charge', d3.forceManyBody()
            .strength(-10)
        )
        .force('center', d3.forceCenter())
        .force('collision', d3.forceCollide()
            .radius(d => d.r * 1.1)
            .iterations(2)
        )
        .force('x', d3.forceX(d => d.layer === -1 ? d.x : 0)
            .strength(d => d.layer === 0 ? 0.1 : (d.layer===-1 ? 0.5 : 0.03))
        )
        .force('y', d3.forceY(d => d.layer === -1 ? d.y : 0)
            .strength(d => d.layer === 0 ? 0.1 : (d.layer===-1 ? 0.5 : 0.03))
        )
        .alphaDecay(0.01)
        .on("tick", ticked);

    function ticked() {
        nodes
            .attr('transform', d => `translate(${d.x} ${d.y})`)
    }

    nodes.call(drag(sim,nodes));

}

function drag(sim,nodes) {
    function dragstarted(e) {
        if (!e.active) sim.alphaTarget(0.3).restart();
        e.subject.fx = e.subject.x;
        e.subject.fy = e.subject.y;
        nodes.style('cursor', 'grabbing')
    }

    function dragged(e) {
        e.subject.fx = e.x;
        e.subject.fy = e.y;
    }

    function dragended(e) {
        if (!e.active) sim.alphaTarget(0);
        e.subject.fx = null;
        e.subject.fy = null;
        nodes.style('cursor', 'grab')
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}

window.addEventListener('resize', () => {

    width = window.innerWidth;
    height = window.innerHeight - header_height - 5;

    svg
        .attrs({
            width: width,
            height: height,
            viewBox: [-width / 2, -height / 2, width, height],
        })
});

function reload(){
    switch (currentPage) {
        case 0:
            load_root();
            break;
        case 1:
            load_projects();
            break;
        case 2:
            load_root();
            break;
        case 3:
            load_root();
            break;
    
        default:
            break;
    }
}

load_root();
