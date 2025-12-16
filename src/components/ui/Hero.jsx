import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import LazyImage from './LazyImage';

const Hero = ({
  title,
  titleHighlight,
  subtitle,
  description,
  backgroundImage,
  logo,
  primaryAction,
  secondaryAction,
  onPrimaryActionClick,
  onSecondaryActionClick,
  actions = [],
  align = 'center',
  className = ""
}) => {

  const isLeftAligned = align === 'left';
  const alignClass = isLeftAligned ? 'text-left lg:text-left' : 'text-center';
  const containerAlignClass = isLeftAligned ? 'mx-0 max-w-3xl' : 'mx-auto max-w-4xl';

  return (
    <section className={`relative min-h-[500px] lg:min-h-[85vh] flex items-center overflow-hidden ${className}`}>
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})`, filter: 'brightness(0.3)' }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-black/50 to-accent/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      <div className="container relative z-10 px-4">
        <div className={`${containerAlignClass} ${alignClass} text-white`}>
          {logo && (
            <motion.div
              className={`mb-8 ${!isLeftAligned ? 'mx-auto' : ''}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
            >
              <LazyImage
                src={logo}
                alt={title}
                className={`mb-6 h-24 w-auto drop-shadow-2xl ${!isLeftAligned ? 'mx-auto' : ''}`}
              />
            </motion.div>
          )}

          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {titleHighlight ? (
              <>
                {title} <br />
                <span className="text-accent drop-shadow-md">
                  {titleHighlight}
                </span>
              </>
            ) : (
              <span className="bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent drop-shadow-md">
                {title}
              </span>
            )}
          </motion.h1>

          {subtitle && (
            <motion.h2
              className="text-2xl md:text-3xl text-white/90 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {subtitle}
            </motion.h2>
          )}

          {description && (
            <motion.p
              className={`text-xl md:text-2xl text-white/90 mb-10 leading-relaxed ${!isLeftAligned ? 'mx-auto' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {description}
            </motion.p>
          )}

          <motion.div
            className={`flex flex-col sm:flex-row gap-4 ${isLeftAligned ? 'justify-start' : 'justify-center'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {/* Support for actions array */}
            {actions.length > 0 ? (
              actions.map((action, index) => (
                action.onClick ? (
                  <Button
                    key={index}
                    variant={action.variant || (index === 0 ? 'primary' : 'secondary')}
                    size="xl"
                    className="shadow-2xl hover:shadow-glow"
                    onClick={action.onClick}
                  >
                    {action.label}
                  </Button>
                ) : (
                  <Button
                    key={index}
                    asChild
                    variant={action.variant || (index === 0 ? 'primary' : 'secondary')}
                    size="xl"
                    className="shadow-2xl hover:shadow-glow"
                  >
                    {action.href?.startsWith('#') ? (
                      <a href={action.href}>{action.label}</a>
                    ) : (
                      <Link to={action.href || '#'}>{action.label}</Link>
                    )}
                  </Button>
                )
              ))
            ) : (
              <>
                {primaryAction && (
                  <Button size="xl" className="shadow-2xl hover:shadow-glow" onClick={onPrimaryActionClick}>
                    {primaryAction}
                  </Button>
                )}
                {secondaryAction && (
                  <Button variant="outline" size="xl" className="border-white/30 text-white hover:bg-white/10 shadow-2xl" onClick={onSecondaryActionClick}>
                    {secondaryAction}
                  </Button>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;