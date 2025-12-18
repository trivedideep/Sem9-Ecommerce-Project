
const tokenstore = (value)=>{
  localStorage.setItem('ecomustoken',JSON.stringify(value))
}

const gettoken = ()=>{
  let data = localStorage.getItem('ecomustoken')
  return JSON.parse(data)
}

 const removeToken = ()=>{
  localStorage.removeItem('ecomustoken')
    }

    const recentlystore = (value)=>{
      localStorage.setItem('recently',JSON.stringify(value))
    }
    
    const getrecetly = ()=>{
      let data = localStorage.getItem('recently')
      return JSON.parse(data)
    }

  export {tokenstore,gettoken,removeToken,recentlystore,getrecetly }

  