import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  blockOffer,
  cast,
  counters,
  graveyard,
  lands,
  life,
  named,
  pickFromZone,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
  enter,
} from "./harness.js";

describe("Invasion batch 2, group E", () => {
  it("Reviving Vapors puts the chosen card in hand, gains its mana value, bins the rest", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    lands(game, "Island", 2);
    const shock = toLibrary(game, "Shock");
    const bears = toLibrary(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    pickFromZone(a, giant);
    const before = life(game, A);
    cast(game, toHand(game, "Reviving Vapors"));
    expect(zone(game, giant)).toBe("hand");
    expect(life(game, A)).toBe(before + 4);
    expect(graveyard(game, A)).toEqual(expect.arrayContaining([bears, shock]));
  });

  it("Crypt Angel returns a red creature card, and can't take a green one", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    pickTargets(a, giant);
    enter(game, "Crypt Angel");
    expect(zone(game, giant)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");

    const t2 = table();
    const onlyGreen = toGraveyard(t2.game, "Grizzly Bears");
    enter(t2.game, "Crypt Angel");
    expect(zone(t2.game, onlyGreen)).toBe("graveyard");
  });

  it("Yavimaya Kavu counts red creatures for power and green ones for toughness", () => {
    const { game } = table();
    const kavu = spawn(game, "Yavimaya Kavu");
    expect(pt(game, kavu)).toEqual({ power: 1, toughness: 1 });
    spawn(game, "Hill Giant", B);
    expect(pt(game, kavu)).toEqual({ power: 2, toughness: 1 });
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears");
    expect(pt(game, kavu)).toEqual({ power: 2, toughness: 3 });
  });

  it("Rampant Elephant makes the target creature block it if able", () => {
    const { game, a } = table();
    const elephant = spawn(game, "Rampant Elephant");
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant", B);
    lands(game, "Forest", 1);
    activate(game, elephant, 0, { targets: [ref(bears)] });
    const offer = blockOffer(game, a, [elephant]);
    expect(offer.blockRequirements).toEqual([{ blocker: bears, attacker: elephant }]);
  });

  it("Skittish Kavu loses its bonus only to an opponent's white or blue creature", () => {
    const { game } = table();
    const kavu = spawn(game, "Skittish Kavu");
    spawn(game, "Wind Drake");
    spawn(game, "Grizzly Bears", B);
    expect(pt(game, kavu)).toEqual({ power: 2, toughness: 2 });
    spawn(game, "Wind Drake", B);
    expect(pt(game, kavu)).toEqual({ power: 1, toughness: 1 });
  });

  it("Ardent Soldier enters with a +1/+1 counter only when kicked", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    cast(game, toHand(game, "Ardent Soldier"), { kicked: true });
    cast(game, toHand(game, "Ardent Soldier"));
    const soldiers = named(game, "Ardent Soldier");
    expect(soldiers.map((id) => counters(game, id)).sort()).toEqual([0, 1]);
  });

  it("Ordered Migration makes a Bird per basic land type; Wandering Stream gains 2 per type", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Ordered Migration"));
    expect(tokensNamed(game, "1/1 Blue Bird Token", A)).toBe(4);
    const before = life(game, A);
    cast(game, toHand(game, "Wandering Stream"));
    expect(life(game, A)).toBe(before + 8);
  });
});
