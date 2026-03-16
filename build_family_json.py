import json

data = []
# ID tracking lookup to map parent-child correctly
persons = {}
id_counter = 1

def add(name, role=None, parent=None, gender="male", spouse=None, highlight=False, desc=""):
    global id_counter
    pid = str(id_counter)
    id_counter += 1
    
    node = { "id": pid, "name": name, "gender": gender }
    if role: node["role"] = role
    if parent: node["parentId"] = parent
    if highlight: 
        node["highlight"] = True
        node["highlightDesc"] = desc
        
    data.append(node)
    persons[name] = pid
    
    if spouse:
        sid = f"{pid}_1"
        data.append({ "id": sid, "name": spouse, "gender": "female", "spouseId": pid })
        
    return pid

# Level 1-6 base Setup
root = add("Nguyễn Thanh Tựu", "Cụ Tổ Đệ Nhất", highlight=True, spouse="Lê Thị Y")
duc = add("Nguyễn Thanh Đức", "Đệ Nhị Thế Tổ", parent=root, spouse="Nguyễn Thị Bình")
tai = add("Nguyễn Thanh Tài", "Đệ Nhị Thế Tổ", parent=root)
than = add("Nguyễn Thanh Thân", "Đệ Nhị Thế Tổ", parent=root)

minh = add("Nguyễn Thanh Minh", "Đệ Tam Thế Tổ", parent=duc, spouse="Nguyễn Thị Đào")
kiem = add("Nguyễn Thanh Kiểm", "Đệ Tam Thế Tổ", parent=duc, spouse="Lê Thị Nhiều")
thanh = add("Nguyễn Thanh Thành", "Đệ Tam Thế Tổ", parent=duc, spouse="Nguyễn Thị Đích")

hung = add("Nguyễn Thanh Hưng", "Đệ Tứ Thế Tổ", parent=minh, spouse="Võ Tự")
gia = add("Nguyễn Thanh Gia", "Đệ Tứ Thế Tổ", parent=minh, spouse="Phan Thị Phẩm")

chg = add("Nguyễn Thanh Chương", "Đệ Ngũ Thế Tổ", parent=hung, spouse="Phan Thị Minh")
tung = add("Nguyễn Thanh Tùng", "Đệ Ngũ Thế Tổ", parent=gia, spouse="Huỳnh Thị Bát")

do = add("Nguyễn Thanh Độ", "Đệ Lục Thế Tổ", parent=chg, spouse="Phan Thị Đố")
dat = add("Nguyễn Thanh Đạt", "Đệ Lục Thế Tổ", parent=chg, spouse="Phạm Thị Tiên")

# LEVEL 7 (Đệ Thất)
luu = add("Nguyễn Thanh Lưu", "Đệ Thất Thế Tổ", parent=do, spouse="Trịnh Thị Tải")
hung7 = add("Nguyễn Thanh Hưng", "Đệ Thất Thế Tổ", parent=do, spouse="Lê Thị Kiến")
bat = add("Nguyễn Thanh Bát", "Đệ Thất Thế Tổ", parent=dat, spouse="Nguyễn Thị Hữu")
bi = add("Nguyễn Thanh Bi", "Đệ Thất Thế Tổ", parent=dat, spouse="Nguyễn Thị Bình")

# LEVEL 8 (Đệ Bát)
don = add("Nguyễn Thanh Đôn", "Đệ Bát Thế Tổ", parent=luu, spouse="Nguyễn Thị Tạo")
hong = add("Nguyễn Thanh Hồng", "Đệ Bát Thế Tổ", parent=luu, spouse="Phan Thị Trọng")
tien = add("Nguyễn Thanh Tiên", "Đệ Bát Thế Tổ", parent=luu)

# LEVEL 9 (Đệ Cửu)
hang = add("Nguyễn Thanh Hằng", "Đệ Cửu Thế Tổ", parent=don)
mat = add("Nguyễn Thanh Mạt", "Đệ Cửu Thế Tổ", parent=don)
nhuoung = add("Nguyễn Thanh Nhượng", "Đệ Cửu Thế Tổ", parent=hong)

# LEVEL 10 (Đệ Thập)
tri = add("Nguyễn Thanh Trị", "Đệ Thập Thế Tổ", parent=hang, spouse="Ngũ Tánh Danh")
ninh = add("Nguyễn Thanh Ninh", "Đệ Thập Thế Tổ", parent=hang)
dung = add("Nguyễn Thanh Dung", "Đệ Thập Thế Tổ", parent=hang, spouse="Nguyễn Thị Hiền", highlight=True, desc="Highlighted point Band 8")

# LEVEL 12 (Đệ Thập Nhị)
can = add("Nguyễn Thanh Cận", "Đệ Thập Nhị Thế Tổ", parent=dung)
hungsung = add("Nguyễn Thanh Hưng", "Đệ Thập Nhị Thế Tổ", parent=dung, spouse="Đỗ Thị Núc")
nhukien = add("Nguyễn Thanh Nhữ Kiến", "Đệ Thập Nhị Thế Tổ", parent=dung, spouse="Lê Thị Chôm")

# LEVEL 13 (Đệ Thập Tam)
ke = add("Nguyễn Thanh Kế", "Đệ Thập Tam Thế Tổ", parent=can)
cach = add("Nguyễn Thanh Cách", "Đệ Thập Tam Thế Tổ", parent=can)
nhuong13 = add("Nguyễn Thanh Nhượng", "Đệ Thập Tam Thế Tổ", parent=hungsung, spouse="Đặng Thị Đoán")
tien13 = add("Nguyễn Thanh Tiến", "Đệ Thập Tam Thế Tổ", parent=nhukien, spouse="Phạm Thị Lơ")

# LEVEL 14 (Đệ Thập Tứ)
dam = add("Nguyễn Thanh Đàm", "Đệ Thập Tứ Thế Tổ", parent=nhuong13, spouse="Nguyễn Thị Cái")
tran = add("Nguyễn Thanh Trân", "Đệ Thập Tứ Thế Tổ", parent=nhuong13)
tuu14 = add("Nguyễn Thanh Tựu", "Đệ Thập Tứ Thế Tổ", parent=tien13)
tuong = add("Nguyễn Thanh Tượng", "Đệ Thập Tứ Thế Tổ", parent=tien13, spouse="Võ Thị Lập")

# LEVEL 15 (Đệ Thập Ngũ)
kinh = add("Nguyễn Thanh Kính", "Đệ Thập Ngũ Thế Tổ", parent=dam, spouse="Đỗ Thị Tình")
mich = add("Nguyễn Thanh Mịch", "Đệ Thập Ngũ Thế Tổ", parent=dam, spouse="Trần Thị Tần")
phat = add("Nguyễn Thanh Phát", "Đệ Thập Ngũ Thế Tổ", parent=tuu14, spouse="Trần Thị Giáp")
ruon = add("Nguyễn Thanh Ruồn", "Đệ Thập Ngũ Thế Tổ", parent=tuu14, spouse="Phạm Thị Kiến")
tang = add("Nguyễn Thanh Tặng", "Đệ Thập Ngũ Thế Tổ", parent=tuong, spouse="Đỗ Thị Trước")

# LEVEL 16 (Đệ Thập Lục - Mở rộng cột trực tiếp)
# Cột dưới Kính
add("Nguyễn Thanh Lâm", "Đệ Thập Lục Thế Tổ", parent=kinh)
add("Nguyễn Thanh Đấu", "Đệ Thập Lục Thế Tổ", parent=kinh)
add("Nguyễn Thanh Cúc", "Đệ Thập Lục Thế Tổ", parent=kinh)

# Cột dưới Mịch
add("Nguyễn Thanh Dũng", "Đệ Thập Lục Thế Tổ", parent=mich)
add("Nguyễn Thanh Đứt", "Đệ Thập Lục Thế Tổ", parent=mich)
add("Nguyễn Thanh Quốc", "Đệ Thập Lục Thế Tổ", parent=mich)

# Cột dưới Phát
add("Nguyễn Thanh Chữ", "Đệ Thập Lục Thế Tổ", parent=phat)
add("Nguyễn Thanh Hừng", "Đệ Thập Lục Thế Tổ", parent=phat)

# Cột dưới Ruồn
add("Nguyễn Thanh Lăng", "Đệ Thập Lục Thế Tổ", parent=ruon)
add("Nguyễn Thanh Nam", "Đệ Thập Lục Thế Tổ", parent=ruon)

# Cột dưới Tặng
add("Nguyễn Thanh Bốn", "Đệ Thập Lục Thế Tổ", parent=tang)
add("Nguyễn Thanh Chặt", "Đệ Thập Lục Thế Tổ", parent=tang)

with open('web/src/data/family.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Saved full recursive level representation completely.")
