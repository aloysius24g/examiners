import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useUserContext } from "@/components/user-context";
import apiClient from "@/lib/axiosClient";
import { abilitiesFor } from "@/permissions";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";


import type { TsUserListDTO } from '../../../backend/src/controllers/tsUserController';
import { ExternalLink } from "lucide-react";
import { useFormik } from "formik";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "react-responsive";
import { cn } from "@/lib/utils";

export default function ExaminersList() {
  const isMobile = useMediaQuery({ maxWidth: 767 });
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
    let isFilterPropsUsed = false;
    const filterProps = Object.fromEntries(
      Object.entries(fs.values).map(([key, value]) => {
        const trimedValue = value.trim();
        if(trimedValue !== '') {
          isFilterPropsUsed = true;
        }
        return [key, trimedValue];
      })
    )

    if(! isFilterPropsUsed) {
      return examinerListQuery.data.sort((e1, e2) => e2.id - e1.id);
    }
    const filtered =  examinerListQuery.data.filter(examiner => {
      // just if guard conditions and return false if any fail.

      // name filtering
      if(
        ! examiner.bio.name.toLowerCase().includes(filterProps.name.toLowerCase())
      ) {
        return false;
      }

      // department filtering
      if(
        ! examiner.bio.department.toLowerCase().includes(filterProps.department.toLowerCase())
      ) {
        return false;
      }

      // code filtering
      if(
        filterProps.courseCode !== '' &&
        ! examiner.theoryHandled.some(th => th.courseCode.toLowerCase().includes(filterProps.courseCode.toLowerCase())) &&
        ! examiner.practicalHandled.some(th => th.courseCode.toLowerCase().includes(filterProps.courseCode.toLowerCase()))
      ) {
        return false;
      }

      // Title filtering
      if(
        filterProps.courseTitle !== '' &&
        ! examiner.theoryHandled.some(th => th.courseTitle.toLowerCase().includes(filterProps.courseTitle.toLowerCase())) &&
        ! examiner.practicalHandled.some(th => th.courseTitle.toLowerCase().includes(filterProps.courseTitle.toLowerCase()))
      ) {
        return false;
      }

      return true;
    });

    const sorted = filtered.sort((e1, e2) => e2.bio.yearOfExperience - e1.bio.yearOfExperience)

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

    <h1>Examiners</h1>
    <Card className={cn(
      'block',
      isMobile && 'hidden'
    )} >
      <CardContent className="sm:grid sm:grid-cols-[3fr_4fr_3fr_4fr_1fr_1fr] grid-cols-1">
        <p className="text-xs text-muted-foreground">Name</p>
        <p className="text-xs text-muted-foreground">Department</p>
        <p className="text-xs text-muted-foreground">Designation</p>
        <p className="text-xs text-muted-foreground">College</p>
        <p className="text-xs text-muted-foreground">Experience</p>
        <p className="text-xs text-muted-foreground flex justify-end">Open</p>
      </CardContent>
    </Card>
      {memoizedFilteredExaminers.map((examiner) => (
        <Card key={examiner.id}>
          <CardHeader>
          <div className="flex gap-2">
            { (examiner.userVerified !== undefined) &&
             <Badge className={examiner.userVerified ? 'bg-green-400' : 'bg-yellow-300'} >
              {examiner.userVerified ? 'Verified' : 'Not Verified'}
             </Badge>
            }

          { (examiner.userBlacklisted) &&
           <Badge variant="destructive" >
            Blacklisted
           </Badge>
          }
          </div>
          </CardHeader>
          <CardContent className={
              cn(
                "grid grid-cols-[3fr_4fr_3fr_4fr_1fr_1fr]",
                isMobile && 'grid-cols-[1fr_2fr]'
              )
          } >
              {isMobile && <p className="flex items-center">Name</p>}
              <p className="flex items-center">{examiner.bio.name}</p>

              {isMobile && <p className="flex items-center">Department</p>}
              <p className="flex items-center">{examiner.bio.department}</p>

              {isMobile && <p className="flex items-center">Designation</p>}
              <p className="flex items-center">{examiner.workPlace.designation}</p>

              {isMobile && <p className="flex items-center">College Name</p>}
              <p className="flex items-center">{examiner.workPlace.collegeName}</p>

              {isMobile && <p className="flex items-center">Year of Experience</p>}
              <p className="flex items-center">{examiner.bio.yearOfExperience} years</p>

              {isMobile && <p className="flex items-center">Open</p>}
              <NavLink
                //target="_blank"
                key={examiner.id}
                to={`/examiners/${examiner.id}`}
                className={
                  cn(
                    'flex flex-col py-2 rounded-md text-sm items-center cursor-pointer border',
                    isMobile && 'items-start border-none'
                  )
                }>
                <ExternalLink className="text-center" />
              </NavLink>
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
