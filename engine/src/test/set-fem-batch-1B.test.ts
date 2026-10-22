import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  life,
  pickFromZone,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Spore Flower", () => {
  it("removes three spore counters to prevent all combat damage this turn", () => {
    const { game, a } = table();
    const flower = spawn(game, "Spore Flower");
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, flower, 0)).toThrow();
    game.state.objects[flower].counters.spore = 3;
    activate(game, flower, 0);
    expect(counters(game, flower, "spore")).toBe(0);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(20);
  });
});

describe("Icatian Moneychanger", () => {
  it("enters with three credit counters, deals 3 to you, and cashes in only during your upkeep", () => {
    const { game } = table();
    const changer = enter(game, "Icatian Moneychanger");
    expect(counters(game, changer, "credit")).toBe(3);
    expect(life(game, A)).toBe(17);
    expect(() => activate(game, changer, 0)).toThrow();
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, changer, "credit")).toBe(4);
    activate(game, changer, 0);
    expect(zone(game, changer)).toBe("graveyard");
    expect(life(game, A)).toBe(21);
  });
});

describe("Conch Horn", () => {
  it("draws two, then puts a card from hand on top of the library", () => {
    const { game, a } = table();
    lands(game, "Wastes", 1);
    const horn = spawn(game, "Conch Horn");
    const before = hand(game).length;
    const keep = toHand(game, "Grizzly Bears");
    pickFromZone(a, keep);
    activate(game, horn, 0);
    expect(hand(game).length).toBe(before + 2);
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1] === keep || library[0] === keep).toBe(true);
    expect(zone(game, keep)).toBe("library");
    expect(zone(game, horn)).toBe("graveyard");
  });
});

describe("Fungal Bloom", () => {
  it("puts a spore counter on a target Fungus only", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const bloom = spawn(game, "Fungal Bloom");
    const thallid = spawn(game, "Thallid");
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, bloom, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, bloom, 0, { targets: [ref(thallid)] });
    expect(counters(game, thallid, "spore")).toBe(1);
  });
});

describe("Thrull Wizard", () => {
  it("counters a black spell whose controller can't pay {B} or {3}", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const wizard = spawn(game, "Thrull Wizard");
    const ritual = toHand(game, "Dark Ritual");
    cast(game, ritual, { settle: false });
    activate(game, wizard, 0, { targets: [ref(ritual)] });
    expect(zone(game, ritual)).toBe("graveyard");
    expect(game.state.zones.shared.stack.length).toBe(0);
  });
});

describe("Thrull Retainer", () => {
  it("is sacrificed to regenerate the creature it enchanted", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const retainer = spawn(game, "Thrull Retainer");
    game.state.objects[retainer].attachedTo = bears;
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    activate(game, retainer, 0);
    expect(zone(game, retainer)).toBe("graveyard");
    destroy(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Orcish Captain", () => {
  it("targets only an Orc, which gets +2/+0 or -0/-2 by the flip", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const captain = spawn(game, "Orcish Captain");
    const bears = spawn(game, "Grizzly Bears");
    const orcs = spawn(game, "Ironclaw Orcs");
    expect(() => activate(game, captain, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, captain, 0, { targets: [ref(orcs)] });
    const won = zone(game, orcs) === "battlefield" && pt(game, orcs).power === 4 && pt(game, orcs).toughness === 2;
    const lost = zone(game, orcs) === "graveyard";
    expect(won || lost).toBe(true);
  });
});

describe("Icatian Javelineers", () => {
  it("enters with one javelin counter and throws it once", () => {
    const { game } = table();
    const jav = enter(game, "Icatian Javelineers");
    expect(counters(game, jav, "javelin")).toBe(1);
    activate(game, jav, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    game.state.objects[jav].tapped = false;
    expect(() => activate(game, jav, 0, { targets: [ref(B)] })).toThrow();
  });
});

describe("Homarid Spawning Bed", () => {
  it("makes Camarids equal to the sacrificed blue creature's mana value", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const bed = spawn(game, "Homarid Spawning Bed");
    const bears = spawn(game, "Grizzly Bears");
    const act = (sacrifice: string) =>
      ({ type: "activate-ability", player: A, source: bed, abilityIndex: 0, targets: [], sacrifice }) as const;
    expect(game.canDispatch(act(bears) as never)).not.toBeNull();
    const crow = spawn(game, "Storm Crow");
    game.dispatch(act(crow) as never);
    settle(game);
    expect(zone(game, crow)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(tokensNamed(game, "Camarid Token", A)).toBe(2);
  });
});

describe("Ring of Renewal", () => {
  it("discards a card at random, then draws two", () => {
    const { game } = table();
    lands(game, "Wastes", 5);
    const ring = spawn(game, "Ring of Renewal");
    const before = hand(game).length;
    const yardBefore = graveyard(game).length;
    activate(game, ring, 0);
    expect(hand(game).length).toBe(before + 1);
    expect(graveyard(game).length).toBe(yardBefore + 1);
  });
});

describe("Icatian Town", () => {
  it("creates four 1/1 white Citizens", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    cast(game, toHand(game, "Icatian Town"));
    expect(tokensNamed(game, "White Citizen Token", A)).toBe(4);
  });
});

describe("Dwarven Armorer", () => {
  it("puts the counter kind chosen on resolution on the target", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const armorer = spawn(game, "Dwarven Armorer");
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    pickModes(a, 1);
    activate(game, armorer, 0, { targets: [ref(bears)] });
    expect(hand(game).length).toBe(before - 1);
    expect(counters(game, bears, "+1/+0")).toBe(1);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
  });
});
