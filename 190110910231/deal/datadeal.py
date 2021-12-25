import json
with open('../data/DataUser.json','r') as f:
    data = json.load(f)
    stationName=[]
    for item in data:
        stationName.append(item['from_station_name'])
        stationName.append(item['to_station_name'])
    stationName = list(set(stationName))
    #print(data)
    days = []
    for i in range(len(data)):
        time = int(data[i]['start_time'][11:13])
        type = data[i]['start_time'][-2:]
        day = int(data[i]['start_time'][3:5])
        days.append(day)
        if(type=="PM"):
            time = time+12
        data[i]['hour_start']=time
        data[i]['day_start']=day
    days = list(set(days))
    dataLast = {}
    for d in days:
        dataset = []
        for item in data:
            if item['day_start']==d:
                dataset.append(item)
        dataLast["day"+str(d)]=dataset
    dataFinall = []
    id = 0
    for d in days:
        i = 0
        for station in stationName:
            set = {}
            sum = 0
            for item in dataLast["day"+str(d)]:
                if station==item['from_station_name'] or station==item['to_station_name']:
                    sum+=1
            set['Cid']=id
            set['Cnumber']=i
            set['Cname']=station
            set['Day']=d
            set['dayNum']=sum
            i+=1
            id+=1
            dataFinall.append(set)
    with open("../data/dataStation.json",'w',encoding='utf-8') as file:
        file.write(json.dumps(dataFinall, ensure_ascii=False))

