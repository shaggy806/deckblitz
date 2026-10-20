/**
 * Zendikar Rising and its Commander decks (ZNR, ZNC) — group a: party,
 * kicker, Equipment and land-animation cards.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  destroy,
  enter,
  keywords,
  lands,
  life,
  loyalty,
  named,
  pickFromZone,
  pickPermanents,
  pickTargets,
  pt,
  quiet,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  types,
  watchTargets,
  zone,
} from "./harness.js";

describe("Obuun, Mul Daya Ancestor", () => {
  it("landfall puts a counter; at combat a land becomes an X/X with X its power then", () => {
    const { game, a } = table();
    const obuun = spawn(game, "Obuun, Mul Daya Ancestor");
    const forest = spawn(game, "Forest");
    // The landfall counter goes on Obuun, the combat animation on the Forest.
    watchTargets(a, (offered) =>
      offered.map((slot) => (slot.includes(obuun) ? obuun : slot.includes(forest) ? forest : null)),
    );
    enter(game, "Forest", A, { settle: false });
    game.advanceUntil((s) => quiet(s) && s.turn.step === "precombat-main");
    expect(pt(game, obuun)).toEqual({ power: 4, toughness: 4 });
    toStep(game, "begin-combat");
    settle(game);
    expect(types(game, forest)).toContain("creature");
    expect(types(game, forest)).toContain("land");
    expect(pt(game, forest)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, forest).has("trample")).toBe(true);
    expect(keywords(game, forest).has("haste")).toBe(true);
  });
});

describe("Thwart the Grave", () => {
  it("costs {1} less per party creature and returns both cards", () => {
    const { game } = table();
    spawn(game, "Abbey Matron");
    spawn(game, "Academy Raider");
    lands(game, "Swamp", 4);
    const bears = toGraveyard(game, "Grizzly Bears");
    const sorcerer = toGraveyard(game, "Prodigal Sorcerer");
    const thwart = toHand(game, "Thwart the Grave");
    cast(game, thwart, { targets: [ref(bears), ref(sorcerer)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, sorcerer)).toBe("battlefield");
  });
});

describe("Nahiri, Heir of the Ancients", () => {
  it("+1 makes a Kor Warrior and may attach an Equipment to it", () => {
    const { game, a } = table();
    const nahiri = spawn(game, "Nahiri, Heir of the Ancients");
    const mace = spawn(game, "+2 Mace");
    pickPermanents(a, mace);
    loyalty(game, nahiri, 1);
    const [token] = named(game, "Kor Warrior Token", A);
    expect(game.state.objects[mace].attachedTo).toBe(token);
    expect(pt(game, token)).toEqual({ power: 3, toughness: 3 });
  });

  it("−3 deals twice the number of Equipment you control", () => {
    const { game } = table();
    const nahiri = spawn(game, "Nahiri, Heir of the Ancients");
    spawn(game, "+2 Mace");
    spawn(game, "+2 Mace");
    const wurm = spawn(game, "Craw Wurm", B);
    loyalty(game, nahiri, -3, { targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("graveyard");
  });
});

describe("Rockslide Sorcerer", () => {
  it("pings on a Wizard spell, not on another creature spell", () => {
    const { game, a } = table();
    spawn(game, "Rockslide Sorcerer");
    lands(game, "Island", 3);
    lands(game, "Forest", 2);
    pickTargets(a, B);
    cast(game, toHand(game, "Prodigal Sorcerer"));
    expect(life(game, B)).toBe(19);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(life(game, B)).toBe(19);
  });
});

describe("Cragplate Baloth", () => {
  it("kicked, enters with four +1/+1 counters", () => {
    const { game } = table();
    lands(game, "Forest", 10);
    const baloth = toHand(game, "Cragplate Baloth");
    cast(game, baloth, { kicked: true });
    expect(pt(game, baloth)).toEqual({ power: 10, toughness: 10 });
  });
});

describe("Blood Beckoning", () => {
  it("kicked, returns two creature cards", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    cast(game, toHand(game, "Blood Beckoning"), { kicked: true, targets: [ref(bears), ref(giant)] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, giant)).toBe("hand");
  });
});

describe("Fireblade Charger", () => {
  it("has haste while equipped, and dies dealing its last-known power", () => {
    const { game, a } = table();
    const charger = spawn(game, "Fireblade Charger", A, { sick: true });
    expect(keywords(game, charger).has("haste")).toBe(false);
    pickTargets(a, charger);
    enter(game, "Scavenged Blade");
    expect(keywords(game, charger).has("haste")).toBe(true);
    expect(pt(game, charger).power).toBe(3);
    pickTargets(a, B);
    destroy(game, charger);
    settle(game);
    expect(life(game, B)).toBe(17);
  });
});

describe("Nissa's Zendikon", () => {
  it("makes the land a 4/4 reach haste Elemental; when it dies, the land returns to hand", () => {
    const { game } = table();
    const target = spawn(game, "Forest");
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Nissa's Zendikon"), { targets: [ref(target)] });
    expect(types(game, target)).toContain("creature");
    expect(pt(game, target)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, target).has("reach")).toBe(true);
    expect(keywords(game, target).has("haste")).toBe(true);
    destroy(game, target);
    settle(game);
    expect(zone(game, target)).toBe("hand");
  });
});

describe("Resolute Strike", () => {
  it("pumps a Warrior and attaches an Equipment to it", () => {
    const { game, a } = table();
    const raider = spawn(game, "Academy Raider");
    const mace = spawn(game, "+2 Mace");
    lands(game, "Plains", 1);
    pickPermanents(a, mace);
    cast(game, toHand(game, "Resolute Strike"), { targets: [ref(raider)] });
    expect(game.state.objects[mace].attachedTo).toBe(raider);
    expect(pt(game, raider)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("party enters triggers", () => {
  it("Emeria Captain counts itself as the Warrior", () => {
    const { game } = table();
    spawn(game, "Abbey Matron");
    const captain = enter(game, "Emeria Captain");
    expect(pt(game, captain)).toEqual({ power: 3, toughness: 3 });
  });

  it("Thundering Sparkmage deals the party size", () => {
    const { game, a } = table();
    spawn(game, "Academy Raider");
    const wurm = spawn(game, "Craw Wurm", B);
    pickTargets(a, wurm);
    enter(game, "Thundering Sparkmage");
    expect(game.state.objects[wurm].damageMarked).toBe(2);
  });
});

describe("Murasa Rootgrazer", () => {
  it("puts a basic land from hand onto the battlefield", () => {
    const { game, a } = table();
    const grazer = spawn(game, "Murasa Rootgrazer");
    const forest = toHand(game, "Forest");
    pickFromZone(a, forest);
    activate(game, grazer, 0);
    expect(zone(game, forest)).toBe("battlefield");
  });
});
