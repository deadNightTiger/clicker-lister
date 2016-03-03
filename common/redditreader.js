
/*
    ==================================================
    Contains reader functions for use in multiple files.
    Allows for compact reading of save files in code files.
    ==================================================
*/
function readRedditData(data)
{
    itemList = "";
    ancientsList = "";
    $.each(ancients,function(){
        this.level = 0; 
    });
    readAncientLevels(data);
    readRedditAncients(data.ancients.ancients);    
    readGilds(data.heroCollection.heroes);
    if(data.hasOwnProperty("items")){
        if(itemOption === "item"){
            readItems(data.items);
        }else{
            readAbilities(data.items);
        }
    }
    readRedditMisc(data);
    readRedditTime(data);
}

function readAbilities(data)
{
    // console.log("##########################################");
    // console.log("##########################################");
    // console.log("##########################################");
    // console.log("##########################################");
    // console.log("redditreader.js readabilities");
    // console.log(data);
    itemList = "Total Item Bonuses: \n\n";
    var items = "";
    var ability = [];
    var ability_index;
    var item;
    
    if(!data.hasOwnProperty("slots")){
        itemList = "";
        return;
    }

    for(var i=1;i<5;i++){
        if(data.slots.hasOwnProperty(i)){
            item = data.items[data.slots[i]];
        } else {
            continue;
        }

        for (var j=1; j<5; j++) {
            ability_index = -1;
            var bonus_type = "bonusType" + j.toString();
            var bonus_level = "bonus" + j.toString() + "Level";
            if(item[bonus_type] > 0) {
                for(var k=0;k<ability.length;k++){
                    if(ability[k].type === item[bonus_type]){
                        ability_index = k;
                        break;
                    }
                }

                if(ability_index != -1){
                    // console.log("adding to " + bonus_type + " lvl: " +bonus_level );
                    ability[k].level += applyLevelFormula(item[bonus_type],item[bonus_level]);
                    // console.log("new level " + ability[k].level);
                }else{
                    // console.log("newing to " + bonus_type + " lvl: " +bonus_level );
                    ability.push({type:item[bonus_type],level:applyLevelFormula(item[bonus_type],item[bonus_level])});
                }
            }
        }
    }

    for(var m=0;m<ability.length;m++){
        if(outputFormat != "kong"){
            items += "* "
        }

        items += applyExpression(ability[m].type,ability[m].level) + "\n";
    }

    if(items !== ""){
        itemList += items;
    }else{
        itemList += "None;";
    }
}

function readItems(data)
{
    // console.log("*************************************");
    // console.log("*************************************");
    // console.log("*************************************");
    // console.log("*************************************");
    // console.log("*************************************");
    // console.log(data.toString());
    // Takes in data in the form of a json string. data = data.items.items
    itemList = "Items: \n";
    var rarity_arr = ["Common","Uncommon","Rare","Epic","Fabled","Mythical","Legendary","Transcendent"];
    var items = "";
    var ability;
    var item_counter = 0;
    
    $.each(data.items, function() {
        ability = [];
        item_counter++;
        //Check each items' four abilities
        for (var j=1; j<5; j++) {
            var str = "bonusType" + j.toString();
            if(this[str] > 0) {
                ability.push(applyExpression(this[str],applyLevelFormula(this[str],this["bonus" + j + "Level"])));
            }
        }

        //Add generic item information
        if(item_counter === 5){
            items += "Junk Pile:  \n";
        }

        items += this.name.split(" of")[0] + ": ";
        items += rarity_arr[this.rarity-1] + " ";
        items += "Lvl " + this.level + ", ";

        //Add abilities between curlies
        for(var i=0; i<ability.length;i++){
            items += ability[i] + ", ";
        }

        items = items.slice(0,-2);
        items += ";  \n\n";
    }); 

    if(items !== ""){
        itemList += items;
    }else{
        itemList += "None;";
    }
}

function applyExpression(ability_index,lvl)
{
    return abilities[ability_index].effectDescription.replace("%1",lvl);
}

function applyLevelFormula(ability_index,lvl)
{
    // return lvl;
    var siyLib = [0, 25, 50, 75, 100, 125, 150, 175, 200, 225, 249, 273, 297, 321, 345, 369, 393, 417, 441, 465, 488, 511, 534, 557, 580, 603, 626, 649, 672, 695, 717, 739, 761, 783, 805, 827, 849, 871, 893, 915, 936, 957, 978, 999, 1020, 1041, 1062, 1083, 1104, 1125, 1145, 1165, 1185, 1205, 1225, 1245, 1265, 1285, 1305, 1325, 1344, 1363, 1382, 1401, 1420, 1439, 1458, 1477, 1496, 1515, 1533, 1551, 1569, 1587, 1605, 1623, 1641, 1659, 1677, 1695, 1712, 1729, 1746, 1763, 1780, 1797, 1814, 1831, 1848, 1865, 1881, 1897, 1913, 1929, 1945, 1961, 1977, 1993, 2009, 2025];
    var level = 0;
    var formula = abilities[ability_index].levelAmountFormula;
    
    formula == "linear1" ? level = lvl :
        formula == "linear5" ? level =  lvl*5 :
        formula == "linear0_25" ? level = lvl*.25 :
        formula == "linear10" ? level = lvl*10 :
        formula == "linear15" ? level = lvl*15 :
        formula == "linear25" ? level = lvl*25 :
        formula == "solomonRewards" ? level = lvl*5 :
        formula == "linear10" ? level = lvl*10 :
        level = siyLib[lvl];
    
    return level;
}

function readRedditAncients(data)
{
    ancientList = "Ancients: ";
    ancientHolder = "";
    var maxHolder = "Max: ";
    var maxCount = 0;
    var missCount = 0;
    ancientListObjects = [];
    abbreviated = false;
    missHolder = "Not Summoned: ";
    
    $.each(ancients,function() {
        if(this.name === "None"){
            return;
        }
        if(this.level == this.maxLevel){
            maxHolder += this.name + ", ";
            maxCount++;
        }else if(this.level === 0){
            missHolder += this.name + ", ";
            missCount++;
        }else{
            ancientListObjects.push({name:this.name, level:this.level,output:true})
        }
    });

    if(ancientListObjects.length > 0){
        ancientHolder = sortRedditAncients(ancientListObjects) + " \n\n";
        if(maxCount){
            ancientHolder += maxHolder.slice(0,-2) + ";  \n\n";
        }

        if(missCount){
            ancientHolder += missHolder.slice(0,-2) + ";  \n\n";
        }

    }else{
        ancientHolder += "None;  \n\n";
    }

    ancientList += ancientHolder; 
}

function readRedditTime(data)
{
    // Reset the list at start of each call
    timeList = "";
    
    // Grabs the various timestamps in the save.
    creationTime = data.creationTimestamp;
    prevLoginTime = data.prevLoginTimestamp;
    startTime = data.startTimestamp;
    // Grabs the current time, for comparisons.
    currentTime = new Date().getTime();
    // Compares times with current time. The positive signs are to specify integer handling. Javascript!
    timeSinceCreation = +currentTime - +creationTime;
    timeSinceAscension = +currentTime - +startTime;
    
    
    //Adding time to array
    timeHolder = 'Time Since Start: ' + formatRedditTime(timeSinceCreation) + 'Time since ascension: ' + formatRedditTime(timeSinceAscension);
    timeList += timeHolder;
}

function formatRedditTime(time)
{
    // Time coverted to seconds from milliseconds, doesn't need to be more accurate.
    time /= 1000;
    var days = time/(24*60*60);
    var hours = (time/(60*60))%24;
    var minutes = (time/60)%60; 
    var seconds = time%60;
    var result = "";
    // Floor it all, removing remainders
    days = Math.floor(days);
    hours = Math.floor(hours);
    minutes = Math.floor(minutes);
    seconds = Math.floor(seconds);
    
    if(days > 0) result += days + "d, ";
    if(hours > 0) result += hours + "h, ";
    if(minutes > 0) result += minutes + "m, ";
    if(seconds > 0 ) result += seconds + "s, ";
    
    if(result === ""){
        result = "0s, ";
    }
    
    return result;
}

function readRedditMisc(data)
{
    miscList = "";
    var total_relics = "";
    var ID = "";
    var cores = "";
    var rubies = "";
    var achievements = "";
    
    if(data.hasOwnProperty("rubies")){
        rubies = "Rubies: " + formNum(data.rubies) + ", ";
    }

    if(data.hasOwnProperty("titanDamage")){
        ID = "Immortal Damage: " + formNum(data.titanDamage) + "; ";
    }

    if(data.hasOwnProperty("items")){
        if(data.items.hasOwnProperty("salvagePoints")){
            cores = "Forge Cores: " + formNum(data.items.salvagePoints) + "; ";
        }
    }

    if(data.hasOwnProperty("totalRelicsReceived")){
        total_relics = "Total Relics Found: " + data.totalRelicsReceived + "; ";
    }

    if(data.hasOwnProperty("achievements")){
        var counter = 0;
        for(var i in data.achievements){
            if(data.achievements.hasOwnProperty(i)){
                counter++;
            }
        }
        achievements = "Achievements: " + Math.floor(counter/149*100) + "%; ";
    }

    var totalSouls = +data.heroSouls + +soulsSpent;
    miscHolder = 'Misc: HS (' + formNum(data.heroSouls) +  '; Spent on Ancients/Rerolls: ' 
        + formNum(soulsSpent) + '/' + formNum(data.ancients.rerollSoulsSpent) + '; Total: ' 
        + formNum(totalSouls + data.ancients.rerollSoulsSpent) + ') HZE: ' 
        + formNum(data.highestFinishedZonePersist) + '; Current Zone: ' 
        + formNum(data.currentZoneHeight) + '; Ascensions: ' 
        + formNum(data.numWorldResets) +  '; ' 
        + rubies + ID + cores + total_relics + achievements;

    miscList += miscHolder;
}

function formNum(number)
{
    return formatNumber(number);
}

function sortRedditAncients(objectArray)
{
    var levelArray = [];
    sortHolder = "";
    var i = 0;
    $.each(objectArray, function() {
        
        levelArray[i] = this.level;
        i++
    });
    
    if(sortMethod=='asc') levelArray.sort(function(a, b){return a-b});
    if(sortMethod=='desc') levelArray.sort(function(a, b){return b-a});
    
    for (var k = 0; k < levelArray.length; k++){
        $.each(objectArray, function(){
            if(this.level==levelArray[k] && this.output==true){
                sortHolder += this.name + ' (' + formNum(this.level) + '); ';
                this.output=false;
            }
        });
    }

    return sortHolder;
}
