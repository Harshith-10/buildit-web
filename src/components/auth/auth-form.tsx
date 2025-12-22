import Logo from "../common/logo";
import { Card } from "../ui/card";
import SignIn from "./sign-in";

export default function AuthForm() {
  return (
    <div className="grid grid-cols-2 h-full w-full">
      <div className="w-full h-full flex items-center justify-center">
        <SignIn />
      </div>
      <div className="w-full h-full p-4">
        <Card className="flex flex-col items-center justify-center gap-4 w-full h-full">
          <div className="flex items-center gap-4">
            <Logo className="w-14 h-14" />
            <h1 className="text-5xl font-bold">BuildIT</h1>
          </div>
          {/* <p className="text-muted-foreground">Where IARE learns!</p> */}
        </Card>
      </div>
    </div>
  );
}
