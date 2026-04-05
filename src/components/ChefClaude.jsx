import ReactMarkdown from 'react-markdown'


export default function ClaudeRecipe({ recipe }) {
    return (

    <section className='suggested-recipe-container'>
     <ReactMarkdown>
      {recipe}
      </ReactMarkdown>
      </section>
    )
  }
  