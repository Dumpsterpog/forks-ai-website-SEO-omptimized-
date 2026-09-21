import SearchOpportunityArticle from "@/components/SearchOpportunityArticle";
import { SEARCH_OPPORTUNITY_POSTS } from "@/lib/searchOpportunityPosts";
const post=SEARCH_OPPORTUNITY_POSTS.find(p=>p.slug==="how-to-calculate-gpa");
const url="https://forksai.app/blog/"+post.slug;
export const metadata={title:post.title,description:post.description,alternates:{canonical:url},openGraph:{type:"article",title:post.title,description:post.description,url,publishedTime:post.datePublished,modifiedTime:post.datePublished,images:[{url:"/body.png",width:1200,height:630}]},twitter:{card:"summary_large_image",title:post.title,description:post.description,images:["/body.png"]}};
export default function Page(){return <SearchOpportunityArticle post={post}/>;}
