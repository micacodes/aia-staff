# TODO

[See icons link](https://www.npmjs.com/package/react-native-vector-icons#installation)

`react-native-screens` package requires one additional configuration step to properly work on Android devices. Edit MainActivity.java file which is located in `android/app/src/main/java/<your package name>/MainActivity.java`.

Add the highlighted code to the body of MainActivity class:

```java
public class MainActivity extends ReactActivity {
  // ...
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(null);
  }
  // ...
}
```

and make sure to add the following import statement at the top of this file below your package statement:

```java
import android.os.Bundle;
```