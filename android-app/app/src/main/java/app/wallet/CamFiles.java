package app.wallet;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;

import java.io.File;
import java.io.FileNotFoundException;

/**
 * Fiş fotoğrafı için kamera uygulamasının yazacağı geçici dosyayı sunar (uygulamanın önbellek klasöründe, cache/cam).
 * Dışa kapalıdır; kameraya yalnız o tek dosya için geçici yazma izni verilir. Yalnız "fis-<sayı>.jpg" adları kabul edilir.
 */
public class CamFiles extends ContentProvider {
    @Override
    public boolean onCreate() { return true; }

    private File file(Uri u) throws FileNotFoundException {
        String n = u == null ? null : u.getLastPathSegment();
        if (n == null || !n.matches("fis-\\d+\\.jpg") || getContext() == null) throw new FileNotFoundException();
        return new File(new File(getContext().getCacheDir(), "cam"), n);
    }

    @Override
    public ParcelFileDescriptor openFile(Uri u, String mode) throws FileNotFoundException {
        File f = file(u);
        File d = f.getParentFile();
        if (d != null && !d.exists()) d.mkdirs();
        return ParcelFileDescriptor.open(f, ParcelFileDescriptor.parseMode(mode));
    }

    @Override
    public Cursor query(Uri u, String[] proj, String sel, String[] args, String sort) {
        File f;
        try { f = file(u); } catch (FileNotFoundException e) { return null; }
        if (proj == null) proj = new String[]{OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE};
        MatrixCursor c = new MatrixCursor(proj);
        Object[] row = new Object[proj.length];
        for (int i = 0; i < proj.length; i++) {
            if (OpenableColumns.DISPLAY_NAME.equals(proj[i])) row[i] = f.getName();
            else if (OpenableColumns.SIZE.equals(proj[i])) row[i] = f.length();
        }
        c.addRow(row);
        return c;
    }

    @Override
    public String getType(Uri u) { return "image/jpeg"; }

    @Override
    public Uri insert(Uri u, ContentValues v) { return null; }

    @Override
    public int delete(Uri u, String s, String[] a) { return 0; }

    @Override
    public int update(Uri u, ContentValues v, String s, String[] a) { return 0; }
}
