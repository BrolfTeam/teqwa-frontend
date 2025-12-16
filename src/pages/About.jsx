import { motion } from 'framer-motion';
import { FiClock, FiUsers, FiBookOpen } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Hero from '@/components/ui/Hero';
import { Link } from 'react-router-dom';
import mesjidBg from '@/assets/mesjid.png';
import jumeaBg from '@/assets/mesjid2.jpg';
import logo from '@/assets/logo.png';
import { teamData } from '@/data/teamData';
import { aboutData } from '@/data/aboutData';
import TeamMemberCard from '@/components/widgets/TeamMemberCard';
import { Button } from '@/components/ui/Button';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background font-sans selection:bg-primary/20 w-full overflow-x-hidden">
      <Hero
        title={aboutData.hero.title}
        titleHighlight={aboutData.hero.titleHighlight}
        align="left"
        description={aboutData.hero.description}
        backgroundImage={mesjidBg}
        logo={logo}
        primaryAction={<Link to="/contact">Join Our Community</Link>}
        secondaryAction={<Link to="/events">Our Programs</Link>}
      />

      {/* Stats Section */}
      <section className="container container-padding py-12 -mt-20 relative z-20">
        <div className="mx-auto max-w-5xl">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {aboutData.stats.map((stat, index) => (
              <Card key={index} className="border-border/40 hover:border-primary/50 hover:shadow-lg transition-all duration-300 bg-background/50 backdrop-blur-sm dark:bg-card/40 flex flex-col items-center justify-center p-6 text-center">
                <div className="p-4 rounded-full bg-primary/10 mb-4 text-primary">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-4xl font-bold text-foreground mb-2">{stat.number}</div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="container container-padding py-16">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">{aboutData.purpose.title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {aboutData.purpose.subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-bold text-foreground">
                  <div className="p-3 rounded-full bg-primary/10 text-primary mr-4">
                    <aboutData.mission.icon className="h-6 w-6" />
                  </div>
                  {aboutData.mission.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {aboutData.mission.desc}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-bold text-foreground">
                  <div className="p-3 rounded-full bg-accent/10 text-accent-700 mr-4">
                    <aboutData.vision.icon className="h-6 w-6" />
                  </div>
                  {aboutData.vision.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {aboutData.vision.desc}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {aboutData.values.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full border-border/40 hover:border-primary/50 hover:shadow-lg transition-all duration-300 bg-background/50 backdrop-blur-sm dark:bg-card/40">
                <CardContent className="flex flex-col items-center text-center p-6 pt-8">
                  <div className={`p-4 rounded-full ${item.bg} ${item.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Meet Our Team */}
      <section className="py-16 bg-muted/30">
        <div className="container container-padding">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Meet Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              The dedicated individuals serving our community
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamData.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full"
              >
                <TeamMemberCard member={member} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="container container-padding py-20">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">{aboutData.timeline.title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{aboutData.timeline.subtitle}</p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute left-1/2 w-0.5 h-full bg-gradient-to-b from-primary/10 via-primary/30 to-primary/10 transform -translate-x-1/2 hidden md:block" />

            {aboutData.timeline.items.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`mb-12 flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'} text-center md:text-left mb-6 md:mb-0`}>
                  <div className={`hidden md:flex items-center ${index % 2 === 0 ? 'justify-end' : 'justify-start'} mb-2`}>
                    <span className="text-3xl font-bold text-primary/80">{item.year}</span>
                  </div>
                  {/* Mobile Year Display */}
                  <div className="md:hidden text-2xl font-bold text-primary mb-2">{item.year}</div>

                  <Card className="hover:shadow-lg transition-shadow border-border/60 inline-block text-left w-full">
                    <CardHeader className="py-4">
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Timeline Dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-background border-4 border-primary hidden md:flex z-10 shadow-sm">
                  <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                </div>

                <div className="md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-primary text-white relative overflow-hidden">
        {/* Background pattern similar to Home */}
        <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: `url(${jumeaBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>

        <div className="container container-padding relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">{aboutData.cta.title}</h2>
            <p className="text-xl mb-10 text-white/90 leading-relaxed font-medium">
              {aboutData.cta.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="xl" className="bg-accent text-primary-900 hover:bg-accent/90 shadow-lg font-bold">
                <Link to={aboutData.cta.primaryAction.link}>{aboutData.cta.primaryAction.label}</Link>
              </Button>
              <Button asChild size="xl" variant="outline" className="border-white/40 text-white hover:bg-white/10 backdrop-blur-md">
                <Link to={aboutData.cta.secondaryAction.link}>{aboutData.cta.secondaryAction.label}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;