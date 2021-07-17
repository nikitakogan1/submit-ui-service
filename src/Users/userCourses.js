import React from "react";
import "./User.css"
import "./User.css"


export const UserCourses = (props) => {
  
    var studentCoursesList = Object.keys(props.studentCourses)
    var staffCoursesList = Object.keys(props.staffCourses)
    var index = 0
    return (
      <React.Fragment>
          <div class="list-group">
            Courses list:
      {studentCoursesList.map(course => {
              index++
              return (
                index < 6 && <button type="button" onClick={() => props.courseOnClick(course)} class="list-group-item list-group-item-primary">
                {course.replaceAll(":", "/")} - Student
              </button>
              );
      })}
          </div>
          <div class="list-group">
      {staffCoursesList.map(course => {
              index++
              return (
                index < 6 && <button  type="button"  onClick={() => props.courseOnClick(course)} class="list-group-item list-group-item-primary">  
                {course.replaceAll(":", "/")} - Staff
              </button>
              );
      })}
      Click on the "My courses" tab in the navigation bar to see all the courses.
    </div>
      </React.Fragment>
  
    )
  }

  