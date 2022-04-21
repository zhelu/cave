var Cave = {
    directions: ["north", "east", "south", "west"],
    colors: ['<span style="color: #FFAAAA">pink</span>', '<span style="color: #0000AA">blue</span>', '<span style="color: #880088">violet</span>'],
    gems: ['<span style="color: #AAAAAA">diamond</span>', '<span style="color: #770077">amythest</span>', '<span style="color: #00AA00">emerald</span>'],
    roomTemplates: [
        (c, g) => `You are in a room that's covered with ${c} moss, and there are ${g}s embedded in the ceiling.`,
        (c, g) => `You find yourself bathed in ${c} light. You step on some ${g}s and hear them crunch under your feet.`,
        (c, g) => `You are in a room. There are ${c} ${g}s peeking out from the rocks.`,
        (c, g) => `You've entered a large cavernous room, where a single ${c} ${g} juts out of the ground.`],
    rooms: [],
    // Add room later.
    state: { "candle": false, "shovel": false },
    makeRoom(color, gem) {
        var template = this.roomTemplates[Math.trunc(Math.random() * this.roomTemplates.length)];
        return {
            objects: {},
            // Map from direction string to room
            exits: {},
            color() {
                return color;
            },
            gem() {
                return gem;
            },
            toString() {
                var es = "There are exits ";
                var esArr = [];
                var lights = [];
                for (const [d, r] of Object.entries(this.exits)) {
                    esArr.push(d);
                    if (r.objects["candle"] && !this.objects["candle"]) {
                        lights.push(d);
                    }
                }
                esArr.sort();
                esArr.forEach(d => es += d + ", ");
                es = es.substring(0, es.length - 2) + ".";
                var mainDesc = (Cave.state.candle || this.objects["candle"]) ? template(color, gem) : "It is too dark to see anything.";
                if (this.objects["candle"]) {
                    mainDesc += "<p>There is a candle here.";
                }
                if (this.objects["shovel"] && (this.objects["candle"] || Cave.state["candle"])) {
                    mainDesc += "<p>There is a shovel here.";
                }
                if (this.objects["crystalball"] && (this.objects["candle"] || Cave.state["candle"])) {
                    mainDesc += "<p>There is a patch of soft dirt here.";
                }
                if (this.objects["look"] && (this.objects["candle"] || Cave.state["candle"])) {
                    mainDesc += "<p>There is a crystal ball half-buried in the dirt.";
                }
                var text = mainDesc + "<p>" + es;
                if (lights.length > 0) {
                    var lightsText = "There is a dim light coming from ";
                    lights.forEach(d => lightsText += "the " + d + ", ");
                    lightsText = lightsText.substring(0, lightsText.length - 2) + ".";
                    text += "<p>" + lightsText;
                }
                return text;
            }
        };
    },
    shuffle(array) {
        let currentIndex = array.length, randomIndex;

        // While there remain elements to shuffle...
        while (currentIndex != 0) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }

        return array;
    },
    update(newRoom) {
        Cave.state["room"] = newRoom;
        Cave.directions.forEach(d => {
            $("#" + d).css("visibility", newRoom.exits.hasOwnProperty(d) ? "visible" : "hidden");
        });
        $("#candle").css("visibility", newRoom.objects["candle"] ? "visible" : "hidden");
        $("#shovel").css("visibility", (newRoom.objects["shovel"] && (newRoom.objects["candle"] || Cave.state["candle"])) ? "visible" : "hidden");
        $("#dig").css("visibility", (Cave.state["shovel"] && newRoom.objects["crystalball"] && (Cave.state["candle"] || newRoom.objects["candle"])) ? "visible" : "hidden");
        $("#look").css("visibility", newRoom.objects["exit"] ? "visible" : "hidden");
        var stateText = "";
        if (Cave.state["candle"]) {
            stateText += "You are holding a candle.<p>";
        }
        if (Cave.state["shovel"]) {
            stateText += "You have a shovel in your possession.<p>";
        }
        stateText += newRoom.toString();
        $('#out').html(stateText);
    }
};

(function () {
    for (var colorI = 0; colorI < Cave.colors.length; ++colorI) {
        for (var gemI = 0; gemI < Cave.gems.length; ++gemI) {
            Cave.rooms.push(Cave.makeRoom(Cave.colors[colorI], Cave.gems[gemI]));
        }
    }
    Cave.shuffle(Cave.rooms);
    Cave.shuffle(Cave.directions);
    for (var i = 0; i < Cave.rooms.length - 1; ++i) {
        var j = i + 1;
        Cave.rooms[i].exits[Cave.directions[1]] = Cave.rooms[j];
        Cave.shuffle(Cave.directions);
        Cave.rooms[j].exits[Cave.directions[0]] = Cave.rooms[i];
    }
    var connectionCount = 0;
    while (connectionCount < 8) {
        var room1 = Cave.rooms[Math.floor(Math.random() * Cave.rooms.length)];
        var dir1 = Cave.directions[Math.floor(Math.random() * Cave.directions.length)];
        if (room1.exits.hasOwnProperty(dir1)) {
            continue;
        }
        var room2 = Cave.rooms[Math.floor(Math.random() * Cave.rooms.length)];
        var dir2 = Cave.directions[Math.floor(Math.random() * Cave.directions.length)];
        if (room1 === room2 && dir1 == dir2) {
            continue;
        }
        if (room2.exits.hasOwnProperty(dir2)) {
            continue;
        }
        room1.exits[dir1] = room2;
        room2.exits[dir2] = room1;
        ++connectionCount;
    }
    Cave.rooms[Math.floor(Math.random() * Cave.rooms.length)].objects["candle"] = true;
    Cave.rooms[Math.floor(Math.random() * Cave.rooms.length)].objects["shovel"] = true;
    Cave.rooms[Math.floor(Math.random() * Cave.rooms.length)].objects["crystalball"] = true;
})();

$(document).ready(function () {
    Cave.directions.forEach(d => {
        $("#" + d).click(function () { Cave.update(Cave.state["room"].exits[d]); });
    });
    $('#candle').click(function () {
        Cave.state["candle"] = true;
        Cave.state["room"].objects["candle"] = false;
        Cave.update(Cave.state["room"]);
    });
    $('#shovel').click(function () {
        Cave.state["shovel"] = true;
        Cave.state["room"].objects["shovel"] = false;
        Cave.update(Cave.state["room"]);
    });
    $('#dig').click(function () {
        Cave.state["room"].objects["crystalball"] = false;
        Cave.state["room"].objects["exit"] = true;
        Cave.update(Cave.state["room"]);
    });
    $('#look').click(function () {
        $('button').css('visibility', 'hidden');
        $("#out").html("Congratulations! You have escaped from the cave.");
    });
    $('#start').click(function() {
        $('#start').css("display: none");
        while (true) {
            var room = Cave.rooms[Math.floor(Math.random() * Cave.rooms.length)];
            if (!room.objects["candle"]) {
                Cave.update(room);
                break;
            }
        }
    });
});