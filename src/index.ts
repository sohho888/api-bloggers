import express, { Request, Response } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
const app = express()

const jsonBodyMiddleware = bodyParser.json()
app.use(jsonBodyMiddleware)

const corsMiddleware = cors()
app.use(corsMiddleware)
const port = 5001


//=================================================

type ErrorMessageType = {
    message: string | null
    field: string | null
}

type PostType = {
    id: number
    title: string | null
    shortDescription: string | null
    content: string | null
    bloggerId: number
    bloggerName: string | null
}

type BloggerType = {
    id: number
    name: string | null
    youtubeUrl: string | null
}

//=================================================

let bloggers: BloggerType[] = [
    {   id: 1,
        name: "Mike",
        youtubeUrl: "https://www.youtube.com/watch?v=WhcbmFplnQA"
    },
    {   id: 2,
        name: "Sara",
        youtubeUrl: "https://www.youtube.com/watch?v=WhcbmF"
    }
]

let posts: PostType[] = [
    {
        id: 1,
        title: "Portrait of Dr Ferdinand Mainzer. Lovis Corinth",
        bloggerId: 1,
        bloggerName: "Lovis Corinth",
        content: "Ferdinand Mainzer was one of the most fascinating cultural figures in Berlin circa 1900.",
        shortDescription: "Lovis Corinth (1858–1925), was a key figure of German modernist art",
    },
    {
        id: 2,
        title: "Late Afternoon in our Meadow",
        bloggerId: 1,
        bloggerName: "Camille Pissarro",
        content: "He painted a number of views of this meadow which is planted with small trees",
        shortDescription: "In 1884 Pissarro settled with his family in the village of Eragny.",
    },
    {
        id: 3,
        title: "The Drunkard, Zarauz (El Borracho, Zarauz).",
        bloggerId: 2,
        bloggerName: "Joaquín Sorolla",
        content: "Sorolla depicted peasants in the sometimes harsh reality of their lives. ",
        shortDescription: "Five drinkers gather in a tavern in Zarauz,",
    },
]

const validUrl = /^(https?:\/\/)?([\w\.]+)\.([a-z]{2,6}\.?)(\/[\w\.]*)*\/?$/

let setErrors: ErrorMessageType[] = []

//=================================================================================

// Bloggers

app.get('/api/bloggers', (req: Request, res: Response ) => {
    res.status(200).send(bloggers)
})

app.post('/api/bloggers', (req: Request, res: Response ) => {

    const { name, youtubeUrl } = req.body

    if (name.length <= 0) {
        res.status(400).send(
            setErrors.push(
                {
                    field: "name",
                    message: `The field cannot be empty`,
                }
            )
        )
        return
    }

    if (youtubeUrl.length <= 0) {
        res.status(400).send(
            setErrors.push(
                {
                    field: "youtubeUrl",
                    message: `The field cannot be empty`,
                }
            )
        )
        return
    }

    if(!validUrl.test(youtubeUrl)){
        res.status(400).send(
            setErrors.push(
                {
                    field: "youtubeUrl",
                    message: `URL does not meet requirements`,
                }
            )
        )
        return
    }

    const newBlogger = { id: +new Date(), name, youtubeUrl };
    bloggers.push(newBlogger);
    res.status(200).send(newBlogger);

})

app.get('/api/bloggers/:id', (req: Request, res: Response ) => {

    const id = parseInt(req.params.id)

    if(isNaN(id) || id <= 0) {
        res.status(400).send(
            setErrors.push(
                {
                    field: "id",
                    message: `In URI params cannot be empty`,
                }
            )
        )
        return
    }

    const blogger = bloggers.find(b => b.id === id)

    if(blogger === undefined) {
        res.status(400).send(
            setErrors.push(
                {
                    field: "",
                    message: `This blogger does not exist`,
                }
            )
        )
        return
    }

    res.status(200).send(bloggers)
})

app.put('/api/bloggers/:id', (req: Request, res: Response ) => {

    const id = parseInt(req.params.id)
    const { name, youtubeUrl } = req.body

    if (name.length <= 0) {
        res.status(400).send(
            setErrors.push(
                {
                    field: "name",
                    message: `The field cannot be empty`,
                }
            )
        )
        return
    }

    if (youtubeUrl.length <= 0) {
        res.status(400).send(
            setErrors.push(
                {
                    field: "youtubeUrl",
                    message: `The field cannot be empty`,
                }
            )
        )
        return
    }

    const blogger = bloggers.find(b => b.id === id)

    if(blogger === undefined) {
        res.status(400).send(
            setErrors.push(
                {
                    field: "",
                    message: `This blogger does not exist`,
                }
            )
        )
        return
    }

    blogger.name = name
    blogger.youtubeUrl = youtubeUrl

    res.status(200).send(blogger)
})

app.delete('/api/bloggers/:id', (req: Request, res: Response ) => {

    const id = parseInt(req.params.id)

    if(isNaN(id) || id <= 0) {
        res.status(400).send(
            setErrors.push(
                {
                    field: "id",
                    message: `In URI params cannot be empty`,
                }
            )
        )
        return
    }

    let newBlogger = bloggers.filter(b => b.id != id)

    if(newBlogger.length <  bloggers.length) {
        bloggers = newBlogger
        res.sendStatus(204)
    } else {
        res.status(404)
        res.send(
            setErrors.push(
            {
                field: "id",
                message: `blogger not found`,
            }
        ))
    }
})



//=================================================================================

// Posts

app.get('api/posts', (req: Request, res: Response) => {
   const postAndName = posts.map(p => {
        return {...p, bloggerName: bloggers.find(b => b.id == p.bloggerId)}
    })
    res.status(200).send(postAndName)
})

app.post('api/posts', (req: Request, res: Response) => {

    const { title, bloggerId, content, shortDescription } = req.body

    if (title.length <= 0) {
        res.status(400).send(
            setErrors.push(
                {
                    field: "title",
                    message: `The field cannot be empty`,
                }
            )
        )
        return
    }

    if (bloggerId.length <= 0) {
        res.status(400).send(
            setErrors.push(
                {
                    field: "bloggerId",
                    message: `The field cannot be empty`,
                }
            )
        )
        return
    }

    if (typeof content !== "string") {
        res.status(400).send(
            setErrors.push(
                {
                    field: "content",
                    message: `The field cannot be not string`,
                }
            )
        )
        return
    }

    if (typeof shortDescription !== "string") {
        res.status(400).send(
            setErrors.push(
                {
                    field: "shortDescription",
                    message: `The field cannot be not string`,
                }
            )
        )
        return
    }

    const blogger = bloggers.find(
        (b) => b.id === bloggerId
    )

    if (!blogger) {
        res.status(400).send(
            setErrors.push(
                {
                    field: "",
                    message: `Blogger doesn't exist`,
                }
            )
        )
        return
    }

    const newPost: PostType = {
        id: +new Date(),
        title,
        bloggerId,
        bloggerName: blogger?.name,
        content,
        shortDescription,
    }

    posts.push(newPost)

    res.status(201).send(newPost)

})

app.get('api/posts/:id', (req: Request, res: Response) => {

    const id = parseInt(req.params.id)

    if (isNaN(id) || id <= 0) {
        res.status(400).send(setErrors.push(
                {
                    field: "id",
                    message: `In URI params cannot be empty`,
                }
            )
        )
        return
    }

    const post = posts.find(p => p.id === id)

    if(post === undefined) {
        res.status(400).send(
            setErrors.push(
                {
                    field: "",
                    message: `This article does not exist`,
                }
            )
        )
        return
    }

    if(post){
        res.status(200)
        res.send({
            ...post, bloggerName: bloggers.find(b => b.id === id)?.name
        })
    }



    res.status(200).send(post)

})

app.put('api/posts/:id', (req: Request, res: Response) => {

    const { title, bloggerId, content, shortDescription } = req.body
    const id = parseInt(req.params.id)

    if (isNaN(id) || id <= 0) {
        res.status(400).send(setErrors.push(
                {
                    field: "id",
                    message: `In URI params cannot be empty`,
                }
            )
        )
        return
    }


    if (title.length <= 0) {
        res.status(400).send(
            setErrors.push(
                {
                    field: "title",
                    message: `The field cannot be empty`,
                }
            )
        )
        return
    }

    if (bloggerId.length <= 0) {
        res.status(400).send(
            setErrors.push(
                {
                    field: "bloggerId",
                    message: `The field cannot be empty`,
                }
            )
        )
        return
    }

    if (typeof content !== "string") {
        res.status(400).send(
            setErrors.push(
                {
                    field: "content",
                    message: `The field cannot be not string`,
                }
            )
        )
        return
    }

    if (typeof shortDescription !== "string") {
        res.status(400).send(
            setErrors.push(
                {
                    field: "shortDescription",
                    message: `The field cannot be not string`,
                }
            )
        )
        return
    }

    const post = posts.find(p => p.id === id)

    if (post === undefined) {
        res.status(400).send(
            setErrors.push(
                {
                    field: "post",
                    message: `post doesn't exist`,
                }
            )
        )
        return
    }

    const blogger = bloggers.find(
        (b) => b.id === bloggerId
    )

    if (!blogger) {
        res.status(400).send(
            setErrors.push(
                {
                    field: "",
                    message: `Blogger doesn't exist`,
                }
            )
        )
        return
    }

    post.title = title
    post.shortDescription = shortDescription
    post.content = content
    post.bloggerId = bloggerId
    post.bloggerName = blogger.name

    res.status(200).send(post)


})

app.delete('/api/posts/:id', (req: Request, res: Response ) => {

    const id = parseInt(req.params.id)

    if(isNaN(id) || id <= 0) {
        res.status(400).send(
            setErrors.push(
                {
                    field: "id",
                    message: `In URI params cannot be empty`,
                }
            )
        )
        return
    }

    let newPost = posts.filter(p => p.id != id)

    if(newPost.length < posts.length) {
        posts = newPost
        res.send(204)
    } else {
        res.status(404)
        res.send(
            setErrors.push(
                {
                    field: "id",
                    message: `post not found`,
                }
            ))
    }
})





//=================================================================================


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})



