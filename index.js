const header_height = 80;
const width = window.innerWidth;
const height = 950;
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
const header = d3.select('svg#header')
    .attrs({
        width: '100%',
        height: header_height,
    })

const pre_text = header
    .append('text')
    .text('this is:')
    .styles({
        'font-size': 37,
        'fill': '#EEEEEE',
        'dominant-baseline': 'middle',
        'font-family': '"Andale Mono", AndaleMono, monospace',
        'user-select': 'none',
    })
    .attrs({
        x: header_margin.left,
        y: header_height / 2,
    })

const pre_text_bbox = pre_text.node().getBBox();

const name_text = ['j', 'u', 'l', 'i', 'a', 'n'].forEach((char, i) =>
    header
        .append('text')
        .text(char)
        .styles({
            'font-size': 37,
            'fill': '#EEEEEE',
            'dominant-baseline': 'middle',
            'font-family': '"Andale Mono", AndaleMono, monospace',
            'user-select': 'none',
        })
        .attrs({
            x: header_margin.left + pre_text_bbox.width + 20 + i * 22.22,
            y: header_height / 2,
        })
)


// BODY -------------------------------------------
const svg = d3.select('svg#main')
    .attrs({
        width: width,
        height: height,
    })

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

const data = pages.map(d => {
    return {
        name: d.name,
        r: d.r,
        colorHue: Math.random(),
        opacity: 1,
        main: true
    }
})

function updateSim() {
    const curWidth = window.innerWidth
    const curHeight = window.innerHeight - header_height - 5; // -1 because of the <hr> line

    data.push(...
        Array.from({ length: 200 }, () => {
            return {
                name: '',
                r: (Math.random() * 80 + 5),
                x: (Math.random() * curWidth - curWidth / 2) * 2,
                y: (Math.random() * curHeight - curHeight / 2) * 2,
                colorHue: Math.random(),
                opacity: 0.5,
            }
        })
    )

    svg
        .attrs({
            width: curWidth,
            height: curHeight,
            viewBox: [-curWidth / 2, -curHeight / 2, curWidth, curHeight],
        })

    const nodes = svg.selectAll('.node')
        .data(data).enter()
        .append('g')
        .attr('class', 'node')
        .style('cursor', 'grab');
    nodes
        .append('circle')
        .attrs({
            r: d => d.r,
            fill: d => colorScale(d.colorHue),
            opacity: d => d.opacity
        })
    nodes
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
            'fill': d => d.colorHue < 0.2 ? 'white' : 'black'
        })

    function getSize(d) {
        var bbox = this.getBBox(),
            cbbox = this.parentNode.getBBox(),
            scale = Math.min(cbbox.width / bbox.width, cbbox.height / bbox.height);
        d.scale = scale;
    }

    const sim = d3.forceSimulation(data)
        .force('charge', d3.forceManyBody()
            .strength(5)
        )
        .force('center', d3.forceCenter())
        .force('collision', d3.forceCollide()
            .radius(d => d.r * 1.2)
            .iterations(3)
        )
        .force('x', d3.forceX(0)
            .strength(d => d.main ? 0.1 : 0.01)
        )
        .force('y', d3.forceY(0)
            .strength(d => d.main ? 0.2 : 0.02)
        )
        .alphaDecay(0.01)
        .on("tick", ticked);

    function ticked() {
        nodes
            .attr('transform', d => `translate(${d.x} ${d.y})`);
    }

    function drag(sim) {
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
    nodes.call(drag(sim));

}
updateSim();