import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Box from 'ui-box'
interface Props {
    url: string
}



// export  class LockdownComponent extends Component<Props, {}> {
//     render() {
//         return (
//             <div>
                
//             </div>
//         )
//     }
// }





export const LockdownComponent = (props: Props) => {
    return (
        <div>
            Uh-oh! You cant access {props.url} in Lockdown. 
            {/* get time til lockdown ends */}
        </div>
    )
}








