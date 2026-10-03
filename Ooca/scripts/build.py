from pathlib import Path
from html import escape as e
from about_page import render_about

ROOT = Path(__file__).resolve().parents[1]
IMAGE = 'assets/images/'
EMAIL = 'dhittawat@gmail.com'
LINKEDIN = 'https://www.linkedin.com/in/dhittaawat-thongkhum-44bb94a7'

def image_figure(filename, alt, caption=None):
    caption = caption or alt
    return f'''<figure class="evidence"><button class="image-button" data-image="{IMAGE+filename}" data-caption="{e(caption,quote=True)}" aria-label="ขยายภาพ: {e(alt,quote=True)}"><img src="{IMAGE+filename}" alt="{e(alt,quote=True)}" loading="lazy"><span class="zoom-hint">ขยายภาพ ↗</span></button><figcaption class="caption">{caption}</figcaption></figure>'''

def para(text): return '<p>'+text+'</p>'
def note(text): return '<p class="note">'+text+'</p>'
def bullets(items): return '<ul>'+''.join('<li>'+x+'</li>' for x in items)+'</ul>'
def table(rows, headings):
    return '<table><thead><tr>'+''.join('<th scope="col">'+x+'</th>' for x in headings)+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+x+'</td>' for x in row)+'</tr>' for row in rows)+'</tbody></table>'

def date_map():
    rows=[('↻','ลูกค้า','ขอเปลี่ยนวันนัด'),('↔','CS','ตรวจคำขอ'),('▦','ช่าง','ยืนยันวันว่าง'),('⇄','IS','ประสานทีมทดแทน'),('✓','ลูกค้า','ยืนยันนัดใหม่')]
    return '<div class="date-map-label eyebrow">ONE DATE · MANY PEOPLE</div><div class="date-map">'+''.join(f'<div class="date-node"><span class="node-icon" aria-hidden="true">{icon}</span><strong class="thai">{actor}</strong><small class="thai">{task}</small></div>' for icon,actor,task in rows)+'</div>'

CASES = [
  {
    'id':'q-chang-web','number':'01','title':'Q-CHANG Web','type':'CUSTOMER EXPERIENCE','category':'customer','visual':'web','image':'qchang-overview.png',
    'tagline':'จากค้นหาบริการ ถึงจองและกลับมาใช้ซ้ำ',
    'summary':'ปรับเว็บไซต์ฝั่งลูกค้า ตั้งแต่ทางเข้าหมวดบริการ รายละเอียด ตะกร้า และการจอง โดยใช้ฟีดแบ็กทดสอบกับข้อมูลธุรกรรมทบทวนการออกแบบ',
    'facts':[('Role','UX/UI Design'),('Scope','Homepage → Category → PDP → Booking'),('Collaboration','รีวิวและทดสอบร่วมกับ PO และทีม'),('Evidence','Usability test + Transaction insight')],
    'caption':'ภาพรวมการออกแบบ Q-CHANG — artwork ที่ใช้สื่อขอบเขตงาน',
    'chapters':[
      ('service-entry','เลือกทางเข้าจากสิ่งที่อยากทำ',
       para('ได้รับเว็บไซต์เดิมมาปรับในช่วงที่แบรนด์และระบบหลังบ้านกำลังเปลี่ยน ปัญหาแรกคือหมวดบริการจำนวนมากที่ลูกค้าแยกและค้นหาได้ยาก จึงเริ่มจากคำที่ครอบคลุมบริการย่อย แต่เฉพาะพอให้คนรู้ว่าความต้องการของตนอยู่กลุ่มไหน')+
       '<div class="concept-row"><div class="concept-item">ล้าง<small>ทำความสะอาด</small></div><div class="concept-item">ซ่อม<small>แก้สิ่งที่มีอยู่</small></div><div class="concept-item">สร้าง<small>ทำสิ่งใหม่</small></div><div class="concept-item">ต่อเติม<small>เพิ่มพื้นที่ใช้งาน</small></div></div>'+
       para('หลังคาจึงมีทางเข้าต่างกันตามสิ่งที่ลูกค้าต้องการทำ: ซ่อมหลังคาที่รั่ว หรือทำหลังคาต่อเติม แนวทางนี้ให้ผู้ใช้เลือกความต้องการ ก่อนลงไปเลือกรายการบริการเฉพาะ')+
       note('แผงด้านบนเป็นภาพอธิบายหลักการจัดหมวด ไม่ใช่ภาพหน้าจอผลิตภัณฑ์')),
      ('promotion','หาบริการเจอแล้ว แต่โปรโมชั่นอยู่ไหน?',
       para('นำแบบไปรีวิวกับ PO และทีม แล้วร่วมทดสอบกับผู้เข้าร่วมประมาณ 10–12 คน ผ่านคนรู้จักและการแนะนำต่อ เริ่มจากให้สำรวจโดยไม่ชี้นำ แล้วจึงให้โจทย์ เช่น หลังคามีน้ำหยดหรือแอร์สกปรก')+
       para('ไม่พบจุดติดขัดในการใช้แท็บหมวดบริการตามโจทย์ที่ให้ แต่มีคำถามว่า “โปรโมชั่นอยู่ไหน?” จึงปรับทั้งทางเข้าและพื้นที่สื่อสารโปรโมชั่น')+
       bullets(['เพิ่มปุ่มรวมโปรโมชั่นไว้ด้านบน','ขยายความสูงของ Hero section','เพิ่ม CTA บนแบนเนอร์ให้มีทางไปต่อชัดเจน'])+
       para('ในการลองหลังปรับ ไม่พบคำถามเรื่องตำแหน่งโปรโมชั่นแบบเดิม ผู้เข้าร่วมเริ่มเลื่อนสำรวจส่วนต่าง ๆ และมีความเห็นว่าหน้านี้ตอบโจทย์เมื่อมีเรื่องเกี่ยวกับบ้าน')+
       note('เป็นข้อสังเกตเชิงคุณภาพจากกลุ่มทดสอบ ไม่ใช่ผลวัด conversion และยังแยกผลของการปรับแต่ละส่วนออกจากกันไม่ได้')),
      ('pdp','บริการเดียว เลือกตัวเลือกในจุดเดียว',
       para('เดิมบริการเดียวกันถูกแยกเป็นหลายรายการตามขนาดและราคา ตั้งสมมติฐานว่าการอ่านรายการที่คล้ายกันจำนวนมากอาจทำให้ลูกค้าล้า จึงรวมตัวเลือกไว้ในหน้ารายละเอียดบริการเดียว เช่น ขนาด BTU กับราคาของบริการล้างแอร์')+
       table([('ก่อน','บริการเดียว หลายขนาด หลายรายการ'),('หลัง','หน้าบริการเดียว เลือกขนาดและดูราคาภายในหน้า')],['โครงสร้าง','วิธีเลือกบริการ'])+
       para('ใช้ความคุ้นเคยจาก E-commerce เช่น การเลือกสีและขนาดรองเท้าในหน้าเดียวเป็นแนวทาง การลองใช้งานผ่านไปได้ด้วยดีตามที่สังเกต แต่ไม่มีตัวเลขเปรียบเทียบเวลาและความผิดพลาดก่อน–หลัง')),
      ('cart','ความสะดวก ต้องมีเหตุให้ใช้ด้วย',
       para('ตะกร้ารวมตามมาในช่วงท้าย เพราะกระทบระบบหลังบ้านหลายส่วน สมมติฐานคือช่วยลูกค้าที่ต้องการซื้อหลายบริการ ผู้เข้าร่วมสัมภาษณ์ให้ความเห็นว่าสะดวก')+
       para('หลังเปิดใช้ ข้อมูลธุรกรรมที่ทีมตรวจพบว่าลูกค้าส่วนใหญ่ทำรายการบริการเดียว และมีการซื้อข้ามบริการร่วมกันน้อย เช่น ล้างแอร์พร้อมทำความสะอาด')+
       '<blockquote>ความเห็นว่า “สะดวก” ยังไม่ได้บอกว่าลูกค้าจะมีเหตุให้ใช้ฟีเจอร์นั้นบ่อยเพียงใด</blockquote>'+
       para('ทีมคงตะกร้าไว้ แล้วพัฒนาส่วนที่รองรับลูกค้าเดิมต่อ โดยไม่สรุปว่าตะกร้าไม่มีประโยชน์หรือทำให้ยอดขายเปลี่ยนเท่าใด')),
      ('returning','ช่วยลูกค้าเดิมลดการกรอกซ้ำ',
       para('ข้อมูลธุรกรรมมีเบอร์โทรเดิมปรากฏซ้ำในหลายรายการ เป็นสัญญาณของการกลับมาจอง จึงเพิ่มที่อยู่ที่บันทึกไว้ ที่อยู่ที่ใช้ล่าสุด และข้อมูลบัญชีผู้ใช้')+
       para('การจองยังต้องมีเบอร์ที่ติดต่อลูกค้าได้ตามนโยบายบริการ เมื่อเลือกที่อยู่ ระบบนำเบอร์ที่ผูกกับที่อยู่นั้นขึ้นมาให้อัตโนมัติ และลูกค้าแก้ก่อนยืนยันได้')+
       note('รับผิดชอบ UX/UI ตลอดเส้นทางฝั่งลูกค้า และร่วมรีวิว/ทดสอบกับทีม ผลต่ออัตราจองซ้ำหรือระยะเวลาจองยังไม่มีตัวเลขสำหรับอ้างในเคสนี้')+
       image_figure('qchang-overview.png','ภาพรวม Q-CHANG Web บน desktop และ mobile','ภาพปกประกอบเรื่อง เป็น artwork; ข้อค้นพบและผลการทดสอบอ้างอิงคำเล่าของผู้ทำงาน')),
    ],
    'sources':[('https://dhittawat.framer.ai/work/roverride/','หน้าเคสเดิม')]
  },
  {
    'id':'buddy-2-0','number':'02','title':'Buddy App 2.0','type':'TECHNICIAN EXPERIENCE','category':'mobile','visual':'buddy','image':'buddy-onboarding.png',
    'tagline':'สมัครตามความพร้อม พักแล้วกลับมาทำต่อได้',
    'summary':'ปรับ Onboarding ฝั่งช่างจากการกรอกทั้งหมดในครั้งเดียว เป็นส่วนที่เลือกทำและกลับมาทำต่อได้ พร้อมรายละเอียดงานและกรอบการเรียนรู้เบื้องต้น',
    'facts':[('Role','UX/UI Design'),('Scope','Onboarding · Service selection'),('Team','Home ทำร่วมกับ Designer อีก 2 คน'),('Evidence','Usability test · ก่อนเปิดใช้แอป')],
    'caption':'หน้าภาพรวมสมัครเป็นช่าง — ตัวอย่างสถานะรอการอนุมัติ',
    'chapters':[
      ('unfinished','ช่างท้อ ก่อนสมัครเสร็จ',
       para('แอปเดิมให้กรอกข้อมูลทั้งหมดในคราวเดียวและบันทึกเมื่อเสร็จ เป้าหมายหลักของการปรับครั้งนี้คือเปิดทางให้ผู้สมัครที่ท้อหรือยังไม่พร้อมสามารถกลับมาทำต่อได้')+
       para('เอกสารบางอย่างอาจยังไม่อยู่กับตัว ข้อมูลบางเรื่องยังให้ไม่ได้ครบ ทีมคำนึงถึงการสมัครหลังเลิกงานที่ช่างเหนื่อยล้า จึงแบ่งภาระออกเป็นส่วน')+
       note('ความเหนื่อยหลังเลิกงานเป็นบริบทที่ทีมคำนึงถึง ไม่ได้ระบุว่าเป็นผลวิจัยที่วัดโดยตรง เป้าหมายคือแก้ drop-off แต่ยังไม่มีผลหลังเปิดใช้จริง')),
      ('sections','ทำเท่าที่พร้อม แล้วกลับมาทำต่อ',
       para('แบ่งการสมัครเป็น 5 ส่วน ผู้สมัครเลือกทำแยกกันตามความพร้อมและออกจากแอปแล้วกลับมาทำต่อได้ หน้าภาพรวมสรุปข้อมูลและสถานะของแต่ละส่วน')+
       table([('ข้อมูลส่วนตัว','บัตรประชาชนและข้อมูลส่วนตัว'),('ข้อมูลที่อยู่','ที่อยู่ปัจจุบันและที่อยู่สำหรับออกเอกสาร'),('เลือกบริการ','งานที่ต้องการรับ'),('เลือกพื้นที่รับงาน','พื้นที่ที่สะดวกรับงาน'),('เอกสารการรับงานและเงิน','หลักฐานประกอบการสมัคร')],['ส่วน','สิ่งที่ต้องเตรียม'])+
       para('ในแบบมีทั้ง “ใส่ข้อมูลแล้ว” และ “ยังใส่ข้อมูลไม่ครบ” ส่วนภาพนี้แสดง “รอการอนุมัติ” จึงต้องแยกความคืบหน้าการกรอกออกจากสถานะตรวจอนุมัติ')+
       image_figure('buddy-onboarding.png','หน้าสมัครเป็นช่าง แบ่งข้อมูลห้าส่วน','ภาพแสดงรายการที่ส่งแล้วและรอการอนุมัติ ไม่ใช่สถานะของผู้สมัครที่เพิ่งเริ่มกรอก')),
      ('feedback','ผู้ทดสอบเห็นคุณค่าของการค่อย ๆ ทำ',
       '<blockquote>“แบบนี้ดีกว่าตอนพี่สมัคร ค่อย ๆ กลับมาทำได้ ไม่งั้นกรอกที 20 อย่าง ไม่รู้จะเสร็จเมื่อไร”</blockquote>'+
       para('ฟีดแบ็กนี้สะท้อนว่าผู้ทดสอบรับรู้คุณค่าของการทยอยทำและกลับมาทำต่อ เมื่อเทียบกับประสบการณ์สมัครเดิมของตนเอง')+
       note('คำพูดเล่าจากความทรงจำและปรับสะกดให้อ่านง่าย ไม่ใช่การถอดเสียงโดยตรง “20 อย่าง” เป็นคำของผู้ทดสอบ ไม่ใช่จำนวนฟิลด์ที่ตรวจนับ ผู้ทำงานออกจากทีมก่อนปล่อยแอป จึงไม่มีข้อมูลยืนยันว่า drop-off ลดลงจริง')),
      ('service-details','รู้ค่าจ้างและขอบเขตก่อนเลือกงาน',
       para('แยกรายการงานพร้อมค่าจ้างและหน่วยคิดราคา เช่น ต่อจุด พร้อมอุปกรณ์ที่ต้องเตรียม มาตรฐานการทำงาน และเงื่อนไขใบรับรองของบางบริการ')+
       image_figure('buddy-services.png','รายการงานติดตั้งเครื่องทำน้ำอุ่น พร้อมราคา อุปกรณ์ และมาตรฐาน','รายละเอียดบริการแยกตามงาน พร้อมส่วนอุปกรณ์และมาตรฐานการทำงาน')+
       note('ส่วนนี้เล่าตามสิ่งที่ออกแบบและภาพที่มี ผู้ทำงานจำเรื่องเบื้องหลังได้ไม่ครบ จึงไม่เติมปัญหาเดิมหรือผลลัพธ์ทางธุรกิจ')),
      ('learning','กรอบการเรียนรู้สำหรับฝ่ายพัฒนาช่าง',
       para('เตรียมโครงสร้างหน้าบทเรียนและแบบทดสอบเบื้องต้นไว้ให้ฝ่ายพัฒนาช่างนำไปใช้ก่อนอบรม มีทั้ง Q-CHANG 101 และส่วนตามบริการที่ผู้สมัครเลือก')+
       bullets(['รายการบทเรียนและแบบทดสอบ แยกส่วนกลางกับส่วนเฉพาะงาน','สถานะรายชุดและความคืบหน้าระหว่างทำ','แบบที่ตอบผิดแล้วเลือกใหม่ และตัวเลือกยืนยันก่อนส่ง'])+
       para('ขอบเขตงานคือการออกแบบกรอบให้ฝ่ายที่รับผิดชอบนำไปใช้ต่อ ยังไม่มีข้อมูลยืนยันการนำไปใช้จริง หน้า Figma มีหลาย draft และ option จึงไม่รวมทุกหน้าว่าเป็น flow สุดท้ายเดียวกัน')),
    ],
    'sources':[('https://www.figma.com/design/ZtJ1fRuQiehSYg1lRn0mnt/?node-id=12851-220583','Figma · Onboarding'),('https://www.figma.com/design/ZtJ1fRuQiehSYg1lRn0mnt/?node-id=3837-82478','Figma · กรอบบทเรียน')]
  },
  {
    'id':'change-date','number':'03','title':'Change Date','type':'SERVICE & OPERATIONS','category':'service','visual':'date','image':None,
    'tagline':'การเปลี่ยนวันนัดหนึ่งครั้ง กระทบใครบ้าง',
    'summary':'วิเคราะห์ข้อมูลการเปลี่ยนวันนัด และทำให้งานประสานระหว่างลูกค้า ช่าง CS/IS และโปรโมชั่นมองเห็นชัดพอที่ทีมจะนำไปตัดสินใจต่อ',
    'facts':[('Role','Research analysis · Workflow mapping'),('Scope','วิเคราะห์และนำเสนอทางเลือก'),('Context','Q-CHANG · มี.ค.–พ.ค. 2022'),('Evidence','3,999 รายการ · ไม่ใช่ผลปรับปรุง')],
    'caption':'ภาพอธิบายกระบวนการประสานเดิมแบบย่อ ไม่ใช่ flow อัตโนมัติที่เปิดใช้ใหม่',
    'chapters':[
      ('signal','สัญญาณจาก 3,999 รายการ',
       para('ข้อมูลมีนาคม–พฤษภาคม 2022 มีรายการเปลี่ยนวันนัด 3,999 รายการ แบ่งเป็นผ่านเจ้าหน้าที่ 3,545 และลูกค้าทำเอง 454 รายการ ปริมาณที่ผ่านเจ้าหน้าที่เป็นจุดเริ่มต้นให้สำรวจงานประสานที่อยู่หลังคำขอหนึ่งครั้ง')+
       '<div class="number-strip"><div><strong>3,999</strong><span>รายการในข้อมูลต้นทาง</span></div><div><strong>3,545</strong><span>ผ่านเจ้าหน้าที่</span></div><div><strong>454</strong><span>ลูกค้าทำเอง</span></div></div>'+
       note('ตัวเลขคือจำนวนรายการในช่วงเวลาที่ระบุ ไม่ใช่จำนวนลูกค้าไม่ซ้ำ และไม่ใช่ผลสำเร็จหลังออกแบบ')),
      ('coordination','หลังวันที่เปลี่ยน มีคนที่ต้องขยับตาม',
       para('ถ้าช่างเดิมไม่ว่าง คำขออาจส่งผ่าน CS ไปตรวจคิวช่างและทีม IS เพื่อหาทีมทดแทน ก่อนกลับมายืนยันกับลูกค้า ถ้าไม่มีทีมว่างต้องประสานต่อ เลือกวันใหม่ หรือจัดการคืนเงิน')+
       '<div class="visual-date" style="margin-top:25px;border-radius:8px">'+date_map()+'</div>'+
       para('จึงนำการสนทนากลับมาที่ความพร้อมของคนและเวลาในการประสาน ก่อนจะมองค่าธรรมเนียมเป็นทางออกหลัก')),
      ('reminder','เผื่อเวลาให้คนจัดการนัด',
       para('สมมติฐานหนึ่งคือการเตือนก่อนนัดเพียงหนึ่งวันอาจทำให้ลูกค้าเพิ่งนึกถึงนัดแล้วขอเปลี่ยนในช่วงท้าย เสนอการเตือนล่วงหน้า 5 วันเพื่อให้มีเวลาตรวจนัดและประสานทีม')+
       table([('ก่อนนัด 5 วัน','แนวทางเตือนที่เสนอ เพื่อเผื่อเวลาประสาน'),('ก่อนนัด 1 วัน','เวลาการเตือนเดิมที่ตั้งสมมติฐานไว้'),('วันบริการ','ลูกค้าและช่างต้องมีแผนร่วมกัน')],['เวลา','แนวคิด'])+
       note('5 วันเป็นข้อเสนอด้านการประสาน ไม่ใช่ช่วงเวลาที่พิสูจน์ว่าเหมาะสมที่สุด ยังไม่ยืนยันสถานะเปิดใช้ SMS รูปแบบใหม่หรือการตัดสินใจสุดท้ายเรื่องค่าธรรมเนียม')),
      ('team-response','การตอบโจทย์ไปไกลกว่าหน้าปฏิทิน',
       para('สิ่งที่จำได้ว่าทีมปรับหลังนำเสนอครอบคลุมการสื่อสารและการเตรียมบริการหลายส่วน')+
       bullets(['CS/IS: สคริปต์อธิบายการเปลี่ยนวันและผลกระทบ','ทีมช่าง: กติกาเปิด–ปิดปฏิทินที่เข้มงวดขึ้น','MKT และทีมที่ปรึกษาภาคสนาม: ประสานวันโปรโมชั่นและความพร้อมช่าง','Onboarding ช่าง: อธิบายความหมายของการระบุวันที่รับงานได้'])+
       para('บทบาทส่วนตัวคือวิเคราะห์และนำเสนอปัญหากับทางเลือก หัวหน้างานตัดสินใจวิธีดำเนินงาน และทีมที่เกี่ยวข้องเป็นผู้ทำการเปลี่ยนแปลง')+
       note('จำได้ว่าการเปลี่ยนวันน้อยลงเชิงพฤติกรรมหลังปรับกติกา แต่ไม่มีตัวเลขก่อน–หลังและไม่สามารถแยกผลของแต่ละการเปลี่ยนแปลงได้')),
      ('original-research','กลับไปดูข้อมูลต้นทาง',
       image_figure('change-date-research.png','สไลด์ข้อมูลรายการเปลี่ยนวันและช่องทาง','เอกสารนำเสนอเดิม หน้า 3 — หัวเรื่องปัดยอดเป็นประมาณ 4,000; ตัวเลขจริงที่ใช้อ้างคือ 3,999 รายการ')+
       para('คุณค่าของงานคือการทำให้ปัญหาประสานงานมองเห็นชัดพอให้ทีมตัดสินใจ พร้อมระบุให้ตรงว่าส่วนไหนเป็นข้อเสนอ ส่วนไหนเป็นการเปลี่ยนแปลงของทีม')),
    ], 'sources':[]
  },
  {
    'id':'wcf-digital','number':'04','title':'WCF Digital','type':'INTERNAL SYSTEMS','category':'internal','visual':'wcf','image':'wcf-medical-categories.png',
    'card_image':'wcf-cover.png','card_alt':'ภาพรวม WCF Digital แสดงหน้าจอและ flow การทำงานของระบบภายใน',
    'tagline':'ให้กฎ ข้อมูล และข้อยกเว้นทำงานร่วมกัน',
    'summary':'ออกแบบ UX/UI ระบบเงินทดแทนสำหรับเจ้าหน้าที่ โดยทำความเข้าใจ workflow ใบแจ้งหนี้ การตรวจเอกสาร และข้อจำกัดข้ามระบบร่วมกับ BA, SA และ Developer',
    'facts':[('Role','UX/UI · Requirement gathering'),('Scope','Hospital Billing · Document workflow'),('Collaboration','เจ้าหน้าที่ · BA · SA · Developer'),('Evidence','SIT · UAT · การอบรมและส่งมอบ')],
    'caption':'หน้าจอแบ่งหมวดค่ารักษาและเปรียบเทียบราคาที่เรียกเก็บ จ่ายได้ และราคาประกาศ',
    'chapters':[
      ('legacy','ปัญหาทั้งในและนอกหน้าจอ',
       para('WCF Digital รองรับกระบวนการเงินทดแทนจากการบาดเจ็บหรือเจ็บป่วยเนื่องจากการทำงาน ระบบเดิมสะสมกฎและข้อยกเว้นจำนวนมาก ความรู้สำคัญส่วนหนึ่งอยู่ในประสบการณ์ของเจ้าหน้าที่')+
       para('ในงานใบแจ้งหนี้ เจ้าหน้าที่ทำเอกสารและคำนวณใน Excel ภายนอกระบบก่อน แล้วนำผลกลับมาคีย์ใน WCF หน้าจอเดิมหนาแน่นและยังไม่รองรับวิธีทำงานจริงได้ครบ')),
      ('billing','ออกแบบตามงานที่เจ้าหน้าที่ต้องทำ',
       para('เก็บ requirement โดยตรงกับเจ้าหน้าที่วินิจฉัยที่มีประสบการณ์ แล้วทำงานกับ BA, SA และทีมพัฒนาเพื่อแปลงกฎ เอกสาร และ state ให้เป็นหน้าจอที่ทำงานสัมพันธ์กัน')+
       bullets(['จัดข้อมูลตามสถานพยาบาลและช่วงเวลารักษา','รองรับใบแจ้งหนี้หรือใบเสร็จหลายรายการในเคสเดียว','แยกค่าใช้จ่ายตามหมวดมาตรฐาน','เปรียบเทียบราคาที่เรียกเก็บ ราคาที่จ่ายได้ และราคาประกาศ','เชื่อมเอกสารหลักฐานกับข้อมูลที่ตรวจ'])+
       image_figure('wcf-medical-categories.png','หน้าจอหมวดค่ารักษาพยาบาลและคอลัมน์ราคา','ตัวอย่าง UI ที่ใช้หมวดรายการและคอลัมน์ราคาแยกหน้าที่ข้อมูลให้เห็นชัด')),
      ('boundaries','ทำให้ขอบเขตระบบเข้าใจได้บน UI',
       para('งานครอบคลุม interaction/state ฝั่ง WCF และการสื่อสารข้อมูลข้ามระบบกับ BA/SA รวมถึงงานตรวจเอกสารที่เชื่อมกับ ECPS ซึ่งเป็นระบบของอีกบริษัทหนึ่ง')+
       para('รับผิดชอบหน้าจอฝั่ง WCF และร่วมทำให้ flow เชื่อมต่อกันได้ ไม่ใช่เจ้าของ system architecture ผู้พัฒนา ECPS/API หรือผู้กำหนดนโยบายราคา')),
      ('delivery','พิสูจน์ workflow ในการทดสอบและอบรม',
       para('ตามเอกสารเคส งาน Hospital Billing ผ่าน SIT และ UAT เจ้าหน้าที่ทำ flow ตั้งแต่กรอกข้อมูล แยกหมวด ตรวจราคา ถึงออกเอกสารจาก WCF ได้ในการทดสอบและอบรม ระบบถูกส่งมอบแล้ว')+
       note('ผลที่ยืนยันได้อยู่ในช่วงทดสอบ อบรม และส่งมอบ ยังไม่ยืนยัน Go Live ตามกำหนดหรือผลหลังใช้งานจริง เช่น เวลา อัตราความผิดพลาด และ adoption')+
       para('เคสนี้แสดงการเชื่อมความเข้าใจ domain กับงานออกแบบและการส่งต่อให้ทีมพัฒนา โดยไม่ให้ข้อจำกัดระบบกลายเป็นสิ่งที่เจ้าหน้าที่ต้องเดาเอง')),
    ], 'sources':[]
  }
]

# The Smart Asset summary is drawn from the existing Sunday Cloud case.
# Images are the three original assets supplied for this addition.
CASES.append({
    'id':'smart-asset','number':'05','title':'PEC Smart Asset','type':'ASSET MANAGEMENT','category':'internal','visual':'asset','image':'smart-asset-master-flow.png',
    'card_image':'smart-asset-cover.png','card_alt':'ภาพรวม Smart Asset พร้อม flow การจัดการทรัพย์สินและหน้าจอกำหนดสิทธิ์ระดับ BU',
    'tagline':'Different assets. One clear workflow.',
    'summary':'สเปกเบื้องต้นและ UX/UI ของ Master Asset ที่เชื่อม Category, SKU และทรัพย์สินจริง โดยทำงานร่วมกับ Software Engineer แล้วเรียนรู้จากการใช้งาน',
    'facts':[('Role','UX × SA Intern'),('Scope','Initial specifications · Master Asset UX/UI'),('Collaboration','Software Engineer'),('Evidence','Design artifacts · Feedback from use')],
    'caption':'ภาพ flow งาน Master Asset: ความสัมพันธ์ของ Category, SKU และทรัพย์สินจริง — หลักฐานการออกแบบและสเปก',
    'chapters':[
      ('different-assets','เมนูเดียว แต่ทรัพย์สินมีหลายแบบ',
       para('PEC Smart Asset รองรับการจัดการทรัพย์สินและงานเช่า เคสนี้เลือกเล่าส่วน Master Asset ซึ่งกำหนดข้อมูลที่ทรัพย์สินต่างชนิดต้องใช้ แล้วเชื่อมไปสู่การลงทะเบียนและตรวจดูทรัพย์สินจริง')+
       para('รถยนต์ สว่าน ปูนหนึ่งถุง และเอกสารต่ออายุมีตัวตน จำนวน และวงจรการใช้งานต่างกัน การใช้แบบฟอร์มเดียวกันทั้งหมดจึงไม่ช่วยแสดงข้อมูลเฉพาะที่แต่ละงานต้องใช้')),
      ('connected-workflow','ทำความสัมพันธ์ให้เห็น: Category → SKU → Asset',
       table([('Category','กำหนดกติกาและช่องข้อมูลตามประเภท'),('SKU','เก็บนิยามสินค้าที่ใช้ซ้ำได้'),('Asset','ทรัพย์สินจริงรายชิ้น มีตัวตน QR สถานะ และบริบทไซต์ของตัวเอง')],['ข้อมูล','หน้าที่ใน workflow'])+
       para('ใช้ความสัมพันธ์นี้เป็นกรอบของสเปกเบื้องต้นและ UX/UI เพื่อส่งต่อข้อมูลร่วมจาก SKU ไปยังทรัพย์สิน โดยยังคงตัวตนของแต่ละชิ้นไว้')+
       image_figure('smart-asset-master-flow.png','ภาพ flow จาก Category และ SKU ไปยัง Asset','ภาพต้นฉบับที่แสดงความสัมพันธ์ของหน้าจอและข้อมูลใน Master Asset')),
      ('engineering-collaboration','จากสเปกเบื้องต้น สู่การออกแบบร่วมกับ Engineer',
       para('ในบทบาท UX × SA Intern รับผิดชอบสเปกเบื้องต้นและร่วมออกแบบ UX/UI กับ workflow คู่กับ Software Engineer ใช้ Codex ช่วยงานสเปกและการออกแบบ แล้วตรวจ requirement และข้อจำกัดร่วมกับ Engineer')+
       image_figure('smart-asset-bu-permissions.png','ตัวอย่าง UI ความสัมพันธ์ระดับ BU และสิทธิ์ตาม Page หรือ Feature','หน้าจอแสดง Page / Feature, Permission Code และสิทธิ์การทำงาน เป็นหลักฐาน UI ประกอบเคส')),
      ('feedback-from-use','โครงข้อมูลที่ถูกต้อง ยังต้องมีทางเข้าที่เข้าใจได้',
       para('ตามเนื้อหาเคสเดิม ส่วน Master Asset ส่งมอบและเริ่มใช้งานแล้ว การใช้งานทำให้พบว่าผู้ใช้ยังไม่เข้าใจว่าทำไมต้องสร้าง SKU ก่อนทรัพย์สินจริง ขณะเดียวกันข้อมูลจากการย้ายระบบสองรอบยังมาไม่ครบ ทำให้การเพิ่มข้อมูลจำนวนมากติดขัด')+
       para('แนวทางถัดไปที่วางไว้คือเติมและปรับข้อมูลนำเข้า พร้อมเพิ่มทางเข้าดู Asset โดยตรง โดยยังคงความสัมพันธ์กับ SKU และข้อกำหนด SKU ในขั้นตอนสร้าง Asset')+
       note('ทางเข้าดู Asset โดยตรงเป็นแผนปรับปรุงในเคสเดิม ยังไม่ได้ประเมินผลหลังปรับ ขอบเขตที่ยืนยันว่าเริ่มใช้จริงคือ Master Asset ไม่ใช่ทุกโมดูลในงานเช่า')),
    ], 'sources':[]
})

def nav(active):
    links=[('home','index.html','Home'),('about','about.html','About'),('project','project.html','Project')]
    return f'''<a class="skip" href="#main">ข้ามไปเนื้อหา</a><header class="site-header"><div class="wrap header-inner"><a class="brand" href="index.html" aria-label="Dhittawat Thongkhum — Home"><span class="monogram" aria-hidden="true">DT</span><span>DHITTAWAT<small>PRODUCT / UX/UI DESIGNER</small></span></a><button class="menu-toggle" aria-controls="main-nav" aria-expanded="false">Menu +</button><nav class="nav" id="main-nav" aria-label="เมนูหลัก">{''.join(f'<a href="{url}"'+(' aria-current="page"' if key==active else '')+f'>{label}</a>' for key,url,label in links)}</nav></div></header>'''

def footer():
    return f'''<footer class="contact"><div class="wrap"><div class="contact-inner"><div><p class="eyebrow">LET'S TALK ABOUT THE WORK</p><h2>A good conversation.<br>A clearer next step.</h2></div><div><p class="thai">ถ้ามีโจทย์ที่อยากทำความเข้าใจร่วมกัน<br>เริ่มจากคุยเรื่องคน งาน และข้อจำกัดที่เจอได้เลย</p><div class="contact-actions"><a class="button" href="mailto:{EMAIL}">คุยเรื่องงาน <span aria-hidden="true">↗</span></a><a class="text-link" href="{LINKEDIN}" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></div></div></div><div class="footer-bottom"><span>© 2026 Dhittawat Thongkhum</span><span>PRODUCT DESIGN · BANGKOK</span><a href="#top">กลับด้านบน ↑</a></div></div></footer>'''

def shell(title, description, content, active, dialog=False):
    d='''<dialog class="dialog" aria-label="ภาพผลงานขนาดเต็ม"><button class="dialog-close" aria-label="ปิดภาพ">ปิด ×</button><figure><img alt=""><figcaption></figcaption></figure></dialog>''' if dialog else ''
    return f'''<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="{e(description,quote=True)}"><meta name="theme-color" content="#ffffff"><title>{e(title)} — Dhittawat Thongkhum</title><link rel="icon" href="assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="assets/site.css"><script src="assets/site.js" defer></script></head><body id="top">{nav(active)}<main id="main">{content}</main>{footer()}{d}</body></html>'''

def card(c):
    if c['visual']=='date': visual=date_map()
    else: visual=f'<img src="{IMAGE+c.get("card_image",c["image"])}" alt="{e(c.get("card_alt",c["caption"]),quote=True)}" loading="lazy">'
    return f'''<article class="work-card {c['visual']}" data-category="{c['category']}"><a href="{c['id']}.html"><div class="work-visual visual-{c['visual']}">{visual}</div><div class="work-caption"><div><p class="eyebrow">{c['number']} / {c['type']}</p><h3>{c['title']}</h3><p class="thai">{c['tagline']}</p></div><span class="card-arrow" aria-hidden="true">↗</span></div></a></article>'''

def home():
    return '''<section class="hero wrap"><div class="hero-top"><p class="eyebrow">DHITTAWAT THONGKHUM · SELECTED WORK</p><p class="eyebrow">PRODUCT / UX/UI</p></div><div class="hero-canvas"><div class="hero-copy"><h1 class="hero-title"><span>GOOD</span><span>DESIGN.</span><span class="light">A CLEAR</span><span class="light">NEXT STEP.</span></h1><p class="hero-thai thai">ออกแบบให้คนไปต่อได้</p><p class="hero-intro thai">จากการเลือกบริการและสมัครเป็นช่าง<br>ถึงงานประสานและระบบภายใน</p><a class="button" href="#selected">ดูผลงาน <span aria-hidden="true">↗</span></a></div><div class="hero-art" aria-label="ภาพรวมผลงานเว็บไซต์และแอป"><div class="art-orbit" aria-hidden="true"></div><div class="hero-web"><img src="assets/images/qchang-overview.png" alt="ภาพประกอบการออกแบบเว็บไซต์ Q-CHANG"></div><div class="hero-phone"><img src="assets/images/buddy-onboarding.png" alt="หน้าสมัครเป็นช่าง Buddy แบ่งข้อมูลเป็นส่วน"></div><span class="art-label one"><i aria-hidden="true"></i> FROM COMPLEXITY</span><span class="art-label two"><i aria-hidden="true"></i> TO A WAY FORWARD</span><span class="art-arrow" aria-hidden="true">↗</span></div></div><div class="hero-foot"><span>Customer experience / Field teams / Internal systems</span><span>Explore the thinking behind the interface ↓</span></div></section>
    <section class="section" id="selected"><div class="wrap"><div class="section-heading"><p class="eyebrow">[ SELECTED WORK ]</p><h2>Three perspectives.<br>One service.</h2><p class="aside thai">สามมุมของ Q-CHANG<br>ลูกค้า ช่าง และทีมที่ทำให้บริการเกิดขึ้น</p></div><div class="selected-grid">'''+''.join(card(c) for c in CASES[:3])+'''</div><div class="section-link"><a class="text-link" href="project.html">ดูผลงานทั้งหมด <span aria-hidden="true">↗</span></a></div></div></section>
    <section class="section"><div class="wrap approach"><div><p class="eyebrow">[ HOW I THINK ]</p><h2 class="thai">หน้าจอที่ดี<br>เริ่มจากเข้าใจ<br>สิ่งที่คนต้องทำ</h2></div><div><article class="principle"><span class="num">01</span><div><h3>เริ่มจากความตั้งใจของผู้ใช้</h3><p class="thai">จัดหมวดบริการจากสิ่งที่ลูกค้าอยากทำ และให้ช่างสมัครตามความพร้อมของตัวเอง</p></div></article><article class="principle"><span class="num">02</span><div><h3>มองสิ่งที่อยู่หลังหน้าจอ</h3><p class="thai">กฎ ข้อมูล สถานะ และการส่งต่องานต้องเชื่อมกัน ก่อนออกมาเป็น interaction</p></div></article><article class="principle"><span class="num">03</span><div><h3>กลับมาดูสิ่งที่เกิดขึ้นจริง</h3><p class="thai">ใช้ฟีดแบ็กทดสอบและข้อมูลการใช้งานทบทวนแนวคิด พร้อมบอกขอบเขตของหลักฐาน</p></div></article><a class="text-link" href="about.html" style="margin-top:25px">รู้จักวิธีทำงาน <span aria-hidden="true">↗</span></a></div></div></section>
    <section class="section"><div class="wrap support"><div><p class="eyebrow">[ INTERNAL SYSTEMS ]</p><h2>WCF Digital</h2><p class="thai">ออกแบบงานภายในที่กฎ ข้อมูล และข้อยกเว้นต้องทำงานร่วมกัน ตั้งแต่ใบแจ้งหนี้ถึงการตรวจเอกสาร</p><a class="text-link" href="wcf-digital.html">ดูงานระบบภายใน <span aria-hidden="true">↗</span></a></div><a class="support-image" href="wcf-digital.html" aria-label="ดูเคส WCF Digital"><img src="assets/images/wcf-medical-categories.png" alt="หน้าจอ WCF แบ่งหมวดค่ารักษาและเปรียบเทียบราคา" loading="lazy"></a></div></section>'''

def projects():
    filters=[('all','All projects'),('customer','Customer UX'),('mobile','Mobile UX'),('service','Service design'),('internal','Internal systems')]
    return '''<div class="wrap"><section class="page-head"><p class="eyebrow">[ PROJECT / SELECTED CASES ]</p><h1>Work, with<br>the thinking.</h1><p class="thai">งานออกแบบและเหตุผลที่อยู่เบื้องหลัง<br>สามมุมของ Q-CHANG และงานระบบภายใน WCF กับ Smart Asset</p></section><div class="filters" role="group" aria-label="กรองประเภทผลงาน">'''+''.join(f'<button class="filter" data-filter="{key}" aria-pressed="{str(key=="all").lower()}">{label}</button>' for key,label in filters)+'''</div><p class="filter-count" role="status" aria-live="polite">แสดง 5 ผลงาน</p><section class="project-grid" aria-label="ผลงานทั้งหมด">'''+''.join(card(c) for c in CASES)+'''</section></div>'''

def about():
    return render_about(ROOT)

def case_page(c):
    facts='<dl class="case-facts">'+''.join(f'<div><dt>{key}</dt><dd>{value}</dd></div>' for key,value in c['facts'])+'</dl>'
    if c['image']: hero=f'<div class="case-hero {c["visual"]}"><img src="{IMAGE+c["image"]}" alt="{e(c["caption"],quote=True)}"></div>'
    else: hero='<div class="visual-date" style="border-radius:12px">'+date_map()+'</div>'
    toc='<aside class="case-toc"><p class="eyebrow">IN THIS CASE</p><nav aria-label="สารบัญเคส">'+''.join(f'<a href="#{ident}">{index:02d} / {e(title)}</a>' for index,(ident,title,_) in enumerate(c['chapters'],1))+'</nav></aside>'
    chapters=''.join(f'<section class="chapter" id="{ident}"><p class="eyebrow">{index:02d} / {c["type"]}</p><h2>{title}</h2>{body}</section>' for index,(ident,title,body) in enumerate(c['chapters'],1))
    sources=''.join(f'<a href="{url}" target="_blank" rel="noopener noreferrer">{label} ↗</a>' for url,label in c['sources'])
    if sources: chapters+='<div class="source-links">'+sources+'</div>'
    next_c=CASES[(CASES.index(c)+1)%len(CASES)]
    return f'''<div class="wrap"><section class="case-head"><div class="breadcrumb"><a href="project.html">Project</a><span aria-hidden="true">/</span><span>{c['title']}</span></div><p class="eyebrow">{c['number']} / {c['type']}</p><h1>{c['title']}</h1><p class="case-statement">{c['tagline']}</p><p class="case-intro thai">{c['summary']}</p>{facts}</section>{hero}<p class="caption" style="margin-top:13px">{c['caption']}</p><div class="case-layout">{toc}<div class="case-body">{chapters}</div></div><div class="next-case"><a href="{next_c['id']}.html"><div><p class="eyebrow">NEXT CASE / {next_c['type']}</p><h2>{next_c['title']}</h2></div><span class="next-arrow" aria-hidden="true">↗</span></a></div></div>'''

def write(name, value): (ROOT/name).write_text(value,encoding='utf-8')

# Home is owned by React/Vite. Keep index.html and the original foil exploration intact.
write('project.html',shell('Project','ผลงานพร้อมเหตุผลและหลักฐาน: ประสบการณ์ลูกค้า แอปฝั่งช่าง การประสานบริการ และระบบภายใน',projects(),'project'))
write('about.html',shell('About','รู้จัก Dhittawat Thongkhum และวิธีทำงาน Product / UX/UI Design กับคน ข้อมูล กฎ และ workflow',about(),'about'))
for c in CASES: write(c['id']+'.html',shell(c['title'],c['summary'],case_page(c),'project',True))
print(f'Built {2 + len(CASES)} legacy pages at', ROOT)
