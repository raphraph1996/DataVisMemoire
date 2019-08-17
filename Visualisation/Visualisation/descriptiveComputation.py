import re
import enchant
import json

months = {'Jan':'01','Feb':'02','Mar':'03','Apr':'04','May':'05','Jun':'06','Jul':'07','Aug':'08','Sep':'09','Oct':'10','Nov':'11','Dec':'12'}
reversemonths = {'01':'Jan','02':'Feb','03':'Mar','04':'Apr','05':'May','06':'Jun','07':'Jul','08':'Aug','09':'Sep','10':'Oct','11':'Nov','12':'Dec'}
regexURL = r"""(?i)((?:(?:(https?|s?ftp)):\/\/)?(?:www\.)?(?:(?:(?:[A-Z0-9][A-Z0-9-]{0,61}[A-Z0-9]\.)+)(?:com|net|org|edu|gov|mil|aero|asia|biz|cat|coop|info|int|jobs|mobi|museum|name|post|pro|tel|travel|xxx|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cs|cu|cv|cx|cy|cz|dd|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|Ja|sk|sl|sm|sn|so|sr|ss|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw)|(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}))(?::(\d{1,5}))?(?:(?:\/\S+)*))"""
regexMail = r"""(?i)[\w\.-]+@[\w\.-]+[.](?:com|net|org|edu|gov|mil|aero|asia|biz|cat|coop|info|int|jobs|mobi|museum|name|post|pro|tel|travel|xxx|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cs|cu|cv|cx|cy|cz|dd|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|Ja|sk|sl|sm|sn|so|sr|ss|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw)"""
regexPhone = r"""(?:\+\(?[0-9]{1,4}\)?\s?)?(?:[0-9]{3,4}[-\s\./]?[0-9]{2,4}[-\s\./]?[0-9]{2,4}[-\s\./]?[0-9]{2,4})"""
regexSpec = r"""(?i)[^a-z0-9áàâäãåçéèêëíìîïñóòôöõúùûüýÿæœ\s]"""
def dateToStringFrom(dateFrom):
    dateFrom = dateFrom.split()
    if int(dateFrom[0])<10:
        dateFrom = dateFrom[2]+'-'+months[dateFrom[1]]+'-0'+dateFrom[0]+' 00:00:00'
    else:
        dateFrom = dateFrom[2]+'-'+months[dateFrom[1]]+'-'+dateFrom[0]+' 00:00:00'
    return dateFrom

def dateToStringUntil(dateUntil):
    dateUntil = dateUntil.split()
    if int(dateUntil[0])<10:
        dateUntil = dateUntil[2]+'-'+months[dateUntil[1]]+'-0'+dateUntil[0]+' 23:59:59'
    else:
        dateUntil = dateUntil[2]+'-'+months[dateUntil[1]]+'-'+dateUntil[0]+' 23:59:59'
    return dateUntil

def stringToDateFrom(dateFrom):
    dateFrom = dateFrom.split()[0].split('-')
    if dateFrom[2][0] == '0':
        dateFrom = dateFrom[2][1]+' '+reversemonths[dateFrom[1]]+' '+dateFrom[0]
    else:
        dateFrom = dateFrom[2]+' '+reversemonths[dateFrom[1]]+' '+dateFrom[0]
    return dateFrom

def stringToDateUntil(dateUntil):
    dateUntil = dateUntil.split()[0].split('-')
    if dateUntil[2][0] == '0':
        dateUntil = dateUntil[2][1]+' '+reversemonths[dateUntil[1]]+' '+dateUntil[0]
    else:
        dateUntil = dateUntil[2]+' '+reversemonths[dateUntil[1]]+' '+dateUntil[0]
    return dateUntil

def descStats(data,provider,rep):
    try:
        with open('stats.json','r') as input:
            stats = json.load(input)
        input.close()
    except FileNotFoundError:
        stats = {'object_title':{},'object_desc':{}}
    providerStr = ''
    for t in provider.keys():
        if provider[t] != 'All':
            providerStr += provider[t]
    if providerStr in stats[rep].keys():
        return stats[rep][providerStr]

    hyperlinks = 0
    hyperlinkNb =0
    emails = 0
    emailNb =0
    phones = 0
    phoneNb = 0
    specPercent = 0
    french = 0
    english = 0
    dutch = 0
    other = 0
    tot = 0
    totSize = 0
    for i, dat in enumerate(data):
        dat = dat[0]
        urls = re.findall(regexURL,dat)
        if len(urls) > 0:
            hyperlinks += 1
            hyperlinkNb += len(urls)

        mails = re.findall(regexMail, dat)
        if len(mails) > 0:
            emailNb += len(mails)
            emails +=1
            re.sub(regexMail,'',dat)

        numbers = re.findall(regexPhone,dat)
        if len(numbers) > 0:
            phones +=1
            phoneNb += len(numbers)
            re.sub(regexPhone,'',dat)

        special = re.findall(regexSpec,dat)
        specPercent += len(special)/len(data[i][0])
        re.sub(regexSpec,' ',dat)
        totSize += len(dat.split())
        re.sub(r'[0-9]',' ',dat)

        fr = enchant.Dict("fr")
        en = enchant.Dict("en")
        nl = enchant.Dict("nl")

        old = 'fr'
        for word in dat.split():
            if len(word) > 1:
                f = fr.check(word)
                e = en.check(word)
                d = nl.check(word)
                if f==True and e ==False and d==False:
                    french +=1
                    old = 'fr'
                elif e==True and f==False and d == False:
                    english +=1
                    old = 'en'
                elif e==False and f == False and d == True:
                    dutch +=1
                    old = 'nl'
                elif e == False and f == True and d == True:
                    if old == 'fr':
                        french += 1
                        old ='fr'
                    else:
                        dutch +=1
                        old = 'nl'
                elif e == True and f == True and d == False:
                    if old == 'fr':
                        french += 1
                        old ='fr'
                    else:
                        english +=1
                        old ='en'
                elif e == True and f == False and d== True:
                    if old =='nl':
                        dutch +=1
                        old = 'nl'
                    else:
                        english +=1
                        old ='en'
                elif e== True and f== True and d== True:
                    if old == 'fr':
                        french += 1
                        old ='fr'
                    elif old =='nl':
                        dutch +=1
                        old = 'nl'
                    else:
                        english +=1
                        old ='en'
                else:
                    other +=1


        print(i)

    stats[rep][providerStr] = {'hyperlinks':hyperlinks, 'hyperlinksNb':hyperlinkNb, 'emails':emails,'emailsNb':emailNb,'phones':phones,'phoneNb':phoneNb,'spec':specPercent/len(data),'size':totSize/len(data),'French':french/(french+english+other+dutch),'English':english/(french+english+other+dutch),'Dutch':dutch/(french+english+other+dutch),'Other':other/(french+english+other+dutch),'tot':len(data)}

    with open('stats.json','w') as output:
        json.dump(stats,output,indent=1)
    output.close()
    print(hyperlinks)
    print(emails)
    print(phones)
    print(specPercent/len(data))
    print(french/(french+english+other))
    print(english/(french+english+other))
    print(other/(french+english+other))
    return stats[rep][providerStr]
