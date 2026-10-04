"""Render the About page from the locally curated career content."""
import json
from html import escape


def render_about(root):
    data = json.loads((root / 'data/about-profile.json').read_text(encoding='utf-8'))
    icons = json.loads((root / 'data/about-icons.json').read_text(encoding='utf-8'))

    def icon(name):
        return f'<svg class="about-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="assets/icons/ant-design-outlined.svg#{escape(name, quote=True)}" width="24" height="24"></use></svg>'

    def items(values, icon_names):
        return '<ul>' + ''.join(f'<li class="about-icon-row">{icon(icon_names[value])}<span>{escape(value)}</span></li>' for value in values) + '</ul>'

    def education_row(field, text, class_name=''):
        return f'<p class="about-icon-row thai {class_name}">{icon(icons["education"][field])}<span>{escape(text)}</span></p>'

    def career_entry(entry):
        projects = []
        for project in entry['projects']:
            title = escape(project['title'])
            if project['href']:
                title = f'<a href="{escape(project["href"], quote=True)}">{title} <span aria-hidden="true">↗</span></a>'
            projects.append(f'<li>{title}</li>')
        project_list = '<ul class="career-projects" aria-label="โปรเจกต์ที่เกี่ยวข้อง">' + ''.join(projects) + '</ul>' if projects else ''
        return f'''<li><article class="timeline-row">
          <p class="eyebrow muted">{escape(entry['period'])}</p>
          <div><h3>{escape(entry['employer'])}</h3><p class="position">{escape(entry['role'])}</p></div>
          <div><p class="description thai">{escape(entry['scope'])}</p>{project_list}</div>
        </article></li>'''

    timeline = ''.join(career_entry(entry) for entry in data['timeline'])
    personal = ''.join(f'''<article class="about-research-item">
      <p class="eyebrow muted">{escape(project['year'])}</p>
      <h3>{escape(project['title'])}</h3>
      <p class="thai research-context">{escape(project['business'])}</p>
      <p class="thai">{escape(project['responsibility'])}</p>
      <p class="research-flow thai">{escape(project['flow'])}</p>
    </article>''' for project in data['personal'])
    languages = '<br>'.join(f'{escape(language["label"])} · {escape(language["level"])}' for language in data['languages'])
    education = data['education']
    return f'''<div class="wrap about-page">
      <section class="page-head" aria-labelledby="about-title">
        <p class="eyebrow">[ ABOUT / THE PERSON BEHIND THE WORK ]</p>
        <h1 id="about-title">Curious about people.<br>Careful with details.</h1>
        <p class="thai">จากเว็บไซต์และแอปของผู้ใช้ ถึงระบบที่ทีมใช้ทำงาน — ประสบการณ์ วิธีคิด และสิ่งที่ผมกำลังเรียนรู้ต่อ</p>
      </section>
      <section class="about-lead" aria-label="รู้จัก Dhittawat Thongkhum">
        <div>
          <p class="about-statement">ผมสนใจว่าคนกำลังพยายามทำอะไร และอะไรทำให้เขาไปต่อได้ยาก</p>
          <div class="profile-panel">
            <h2 class="profile-name">Dhittawat<br>Thongkhum</h2>
            <dl>
              <div><dt>Practice</dt><dd>Product / UX/UI Design</dd></div>
              <div><dt>Based in</dt><dd>Bangkok, Thailand</dd></div>
              <div><dt>Focus</dt><dd>Workflow &amp; Information</dd></div>
              <div><dt>Collaboration</dt><dd>Product · BA · SA · Dev</dd></div>
              <div><dt>Work preference</dt><dd>{escape(data['availability'])}</dd></div>
              <div><dt>Languages</dt><dd>{languages}</dd></div>
            </dl>
          </div>
        </div>
        <div class="body thai">
          <p>ผมทำงานกับผลิตภัณฑ์ที่ข้อมูล กฎ และคนหลายฝ่ายต้องทำงานสัมพันธ์กัน ทั้งประสบการณ์ฝั่งลูกค้า แอปของทีมภาคสนาม และระบบที่เจ้าหน้าที่ใช้ทำงาน</p>
          <p>งานออกแบบเริ่มจากทำความเข้าใจสิ่งที่ผู้ใช้ต้องทำ แล้วจัดโครงสร้างข้อมูล ลำดับขั้น สถานะ และข้อยกเว้นให้คนเห็นทางไปต่อได้</p>
          <p>ผมใช้การทดสอบและสิ่งที่พบจากการใช้งานทบทวนแนวคิด พร้อมอธิบายขอบเขตงานและหลักฐานให้ตรงกับสิ่งที่ทำจริง</p>
          <p>ในเคส Q-CHANG มีทั้งงานที่รับผิดชอบ UX/UI ตลอดเส้นทางฝั่งลูกค้า และงานที่ทำร่วมกับทีม ส่วน WCF แสดงการทำงานกับเจ้าหน้าที่ BA, SA และทีมพัฒนาในระบบที่มีกฎซับซ้อน</p>
          <p>ปัจจุบันผมต่อยอดความเข้าใจฝั่ง System Analysis ผ่านบทบาท UX × SA Intern ที่ Code(Hard) เพื่อเชื่อมงานออกแบบกับกติกาข้อมูล ข้อจำกัดทางเทคนิค และการทำงานร่วมกับ Software Engineer ให้ใกล้ชิดขึ้น</p>
          <a class="text-link about-work-link" href="project.html">ดูตัวอย่างในผลงาน ↗</a>
        </div>
      </section>
      <nav class="about-jump" aria-label="ส่วนต่าง ๆ ในหน้า About">
        <a href="#career">ประสบการณ์ <span aria-hidden="true">↓</span></a>
        <a href="#research">โปรเจกต์ส่วนตัว <span aria-hidden="true">↓</span></a>
        <a href="#capabilities">ทักษะและการศึกษา <span aria-hidden="true">↓</span></a>
      </nav>
      <section class="section" id="career" aria-labelledby="career-title">
        <div class="section-heading"><p class="eyebrow">[ CAREER / 2015—NOW ]</p><h2 id="career-title">Different contexts.<br>A connected practice.</h2></div>
        <ol class="about-timeline">{timeline}</ol>
      </section>
      <section class="section" id="research" aria-labelledby="research-title">
        <div class="section-heading"><p class="eyebrow">[ PERSONAL PROJECTS ]</p><h2 id="research-title">Questions I keep<br>working on.</h2></div>
        <div class="about-research-grid">{personal}</div>
      </section>
      <section class="section" id="capabilities" aria-labelledby="capabilities-title">
        <div class="section-heading"><p class="eyebrow">[ CAPABILITIES &amp; EDUCATION ]</p><h2 id="capabilities-title">What I bring<br>to the work.</h2></div>
        <div class="about-qualifications">
          <article><h3>{icon(icons['headings']['capabilities'])}<span>Capabilities</span></h3>{items(data['capabilities'], icons['capabilities'])}</article>
          <article><h3>{icon(icons['headings']['tools'])}<span>Tools &amp; methods</span></h3>{items(data['tools'], icons['tools'])}<p class="thai about-method about-icon-row">{icon(icons['methods'][data['methods'][0]])}<span>{escape(data['methods'][0])}</span></p></article>
          <article><h3>{icon(icons['headings']['education'])}<span>Education</span></h3>{education_row('degree', education['degree'], 'education-degree')}{education_row('field', education['field'])}{education_row('school', education['school'] + ' · ' + education['year'])}{education_row('gpa', 'GPA ' + education['gpa'], 'education-meta')}</article>
        </div>
      </section>
      <section class="section" aria-labelledby="working-title">
        <div class="approach">
          <div><p class="eyebrow">[ WORKING TOGETHER ]</p><h2 class="thai" id="working-title">เข้าใจโจทย์ร่วมกัน<br>ก่อนลงรายละเอียด</h2></div>
          <div>
            <article class="principle"><span class="num">01</span><div><h3>จัดโครงสร้าง</h3><p class="thai">Information architecture · User flow · Workflow mapping</p></div></article>
            <article class="principle"><span class="num">02</span><div><h3>ออกแบบและทดสอบ</h3><p class="thai">UX/UI · Prototyping · Usability testing</p></div></article>
            <article class="principle"><span class="num">03</span><div><h3>ส่งต่อให้ทำงานจริง</h3><p class="thai">UI specification · Cross-functional review · UAT support</p></div></article>
          </div>
        </div>
      </section>
    </div>'''
