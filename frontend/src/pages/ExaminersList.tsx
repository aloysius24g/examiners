import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useUserContext } from "@/components/user-context";
import apiClient from "@/lib/axiosClient";
import { abilitiesFor } from "@/permissions";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";


import type { TsUserListDTO } from '../../../backend/src/controllers/tsUserController';
import { SidebarOpen } from "lucide-react";
import { useFormik } from "formik";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ExaminersList() {
  const navigate = useNavigate();

  const userContext = useUserContext();
  //const ability = abilitiesFor(userContext.data)

  useEffect(() => {
    const ability = abilitiesFor(userContext.data)
    if(ability.cannot('view', 'officer')) {
      navigate('/login/examiner');
      //toast.error('Not enough permission.');
    }
  }, [userContext.data])

  const examinerListQuery = useQuery({
    refetchOnMount: 'always',
    queryFn: async() => {
      const res = await apiClient.get<TsUserListDTO>('/examiners')
      return res.data;
    },
    queryKey: ['examinersList']
  }); 

  const fs = useFormik<ExaminerFilterProps>({
    initialValues: {
      name: '',
      department: '',
      courseCode: '',
      courseTitle: '',
    },
    onSubmit: console.log
  })

  // useMemo baby
  const memoizedFilteredExaminers = useMemo(() => {
    if(! examinerListQuery.data) {
      return [];
    }
    const filtered =  examinerListQuery.data.filter(examiner => {
      // just if guard conditions and return false if any fail.

      // name filtering
      if(
        ! examiner.bio.name.toLowerCase().includes(fs.values.name.toLowerCase())
      ) {
        return false;
      }

      // department filtering
      if(
        ! examiner.bio.department.toLowerCase().includes(fs.values.department.toLowerCase())
      ) {
        return false;
      }

      // code filtering
      if(
        fs.values.courseCode !== '' &&
        ! examiner.theoryHandled.some(th => th.courseCode.toLowerCase().includes(fs.values.courseCode.toLowerCase())) &&
        ! examiner.practicalHandled.some(th => th.courseCode.toLowerCase().includes(fs.values.courseCode.toLowerCase()))
      ) {
        return false;
      }

      // Title filtering
      if(
        fs.values.courseTitle !== '' &&
        ! examiner.theoryHandled.some(th => th.courseTitle.toLowerCase().includes(fs.values.courseTitle.toLowerCase())) &&
        ! examiner.practicalHandled.some(th => th.courseTitle.toLowerCase().includes(fs.values.courseTitle.toLowerCase()))
      ) {
        return false;
      }

      return true;
    });

    const sorted = filtered.sort((e1, e2) => e2.id - e1.id)

    return sorted;

  }, [examinerListQuery.data, fs.values]);


  if(examinerListQuery.isLoading) {
    return <h1>Loading...</h1>
  }
  if(! examinerListQuery.data) {
    return <h1>Something went wrong.</h1>
  }

  return (
    <div className="space-y-3">
    <h1>Filter</h1>
    <Card>
      <CardContent className="grid sm:grid-cols-2 grid-cols-1 gap-2 items-center">
        <Label htmlFor="name" className="text-xs text-muted-foreground">Name</Label>
        <Label htmlFor="department" className="text-xs text-muted-foreground">Department</Label>
        <Input name="name" id="name" value={fs.values.name} onChange={e => fs.setFieldValue('name', e.target.value)}/>
        <Input name="department" id="department" value={fs.values.department} onChange={e => fs.setFieldValue('department', e.target.value)} />
        <Label htmlFor="courseCode" className="text-xs text-muted-foreground">Course Code</Label>
        <Label htmlFor="courseTitle" className="text-xs text-muted-foreground">Course Title</Label>
        <Input name="courseCode" id="courseCode" value={fs.values.courseCode} onChange={e => fs.setFieldValue('courseCode', e.target.value)} />
        <Input name="courseTitle"id="courseTitle" value={fs.values.courseTitle} onChange={e => fs.setFieldValue('courseTitle', e.target.value)}/>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          {`${memoizedFilteredExaminers.length} matches of ${examinerListQuery.data.length} examiners.`}
        </div>
        <Button type='button' onClick={() => fs.resetForm()}>
          Clear filter
        </Button>
      </CardFooter>
    </Card>

    <h1>Examiner</h1>
    <Card>
      <CardContent className="grid grid-cols-6 gap-4 items-center">
        <p className="text-xs text-muted-foreground">Name</p>
        <p className="text-xs text-muted-foreground">Department</p>
        <p className="text-xs text-muted-foreground">Designation</p>
        <p className="text-xs text-muted-foreground">College</p>
        <p className="text-xs text-muted-foreground">Experience</p>
        <p className="text-xs text-muted-foreground">Open</p>
      </CardContent>
    </Card>
      {memoizedFilteredExaminers.map((examiner) => (
        <Card key={examiner.id} className="py-1">
          <CardContent className="py-1 flex flex-col gap-3">
          <div className="flex gap-2">
            { (examiner.userVerified !== undefined) &&
             <Badge className={examiner.userVerified ? 'bg-green-400' : 'bg-yellow-400'} >
              {examiner.userVerified ? 'Verified' : 'Not Verified'}
             </Badge>
            }

          { (examiner.userBlacklisted) &&
           <Badge variant="destructive" >
            Blacklisted
           </Badge>
          }
          </div>
            <div className="grid grid-cols-6 gap-4 items-center">
              <div>
                <p className="font-medium">{examiner.bio.name}</p>
              </div>

              <div>
                <p>{examiner.bio.department}</p>
              </div>

              <div>
                <p>{examiner.workPlace.designation}</p>
              </div>

              <div>
                <p>{examiner.workPlace.collegeName}</p>
              </div>

              <div>
                <p>{examiner.bio.yearOfExperience} years</p>
              </div>

              <div>
              <NavLink
                //target="_blank"
                key={examiner.id}
                to={`/examiners/${examiner.id}`}
                className="block px-3 py-2 rounded-md text-sm"
              >
                <SidebarOpen />
              </NavLink>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// examiner filter logic with rule logic
// I generatted these complex types with chatgpt, heeheh

type ExaminerFilterProps = {
  name: string,
  department: string,
  courseCode: string,
  courseTitle: string,
}
