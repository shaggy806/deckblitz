/**
 * Card batch 49, part a (2026-10-11): ranks 6820–6841. Written on the shared
 * table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import { printedCardName } from "../state.js";

import {
  A,
  B,
  C,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
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
} from "./harness.js";

describe("Voracious Fell Beast", () => {
  it("makes a Food only for each creature actually sacrificed", () => {
    const { game } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", B);
    // Carol has no creature to sacrifice.
    enter(game, "Voracious Fell Beast");
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
  });
});

describe("Outland Liberator", () => {
  it("enters as Frenzied Trapbreaker at night, whose attack destroys an artifact the defender controls", () => {
    const { game, a } = table();
    game.state.dayNight = "night";
    const wolf = enter(game, "Outland Liberator");
    expect(printedCardName(game.state.objects[wolf])).toBe("Frenzied Trapbreaker");
    expect(pt(game, wolf)).toEqual({ power: 3, toughness: 3 });
    const ring = spawn(game, "Sol Ring", B);
    pickTargets(a, ring);
    attack(game, a, [wolf]);
    expect(zone(game, ring)).toBe("graveyard");
  });
});

describe("Aragorn and Arwen, Wed", () => {
  it("puts a counter on each other creature and gains 1 life for each other creature", () => {
    const { game } = table();
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const theirs = spawn(game, "Grizzly Bears", B);
    const pair = enter(game, "Aragorn and Arwen, Wed");
    expect(bears.map((id) => counters(game, id))).toEqual([1, 1]);
    expect(counters(game, pair)).toBe(0);
    expect(counters(game, theirs)).toBe(0);
    expect(life(game, A)).toBe(22);
  });
});

describe("Consumed by Greed", () => {
  it("unpromised, the target opponent sacrifices their greatest-power creature", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const handBefore = hand(game, B).length;
    cast(game, toHand(game, "Consumed by Greed"), { targets: [ref(B)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(hand(game, B).length).toBe(handBefore);
  });

  it("promised, the opponent draws first and you return a creature card from your graveyard", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const giant = spawn(game, "Hill Giant", B);
    const back = toGraveyard(game, "Grizzly Bears");
    const handBefore = hand(game, B).length;
    cast(game, toHand(game, "Consumed by Greed"), { targets: [ref(B), ref(back)], kicked: true });
    expect(hand(game, B).length).toBe(handBefore + 1);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, back)).toBe("hand");
  });
});

describe("Sokka's Charge", () => {
  it("gives Allies you control double strike and lifelink during your turn only", () => {
    const { game } = table();
    spawn(game, "Sokka's Charge");
    const ally = spawn(game, "Beastcaller Savant");
    const other = spawn(game, "Grizzly Bears");
    expect(keywords(game, ally).has("double-strike")).toBe(true);
    expect(keywords(game, ally).has("lifelink")).toBe(true);
    expect(keywords(game, other).has("double-strike")).toBe(false);
    nextTurn(game);
    expect(keywords(game, ally).has("double-strike")).toBe(false);
    expect(keywords(game, ally).has("lifelink")).toBe(false);
  });
});

describe("Dance of the Tumbleweeds", () => {
  it("both modes: a Desert onto the battlefield, then an X/X counting it", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    const desert = toLibrary(game, "Abraded Bluffs");
    pickFromZone(a, desert);
    pickTargets(a, B); // the Bluffs' own enters trigger
    cast(game, toHand(game, "Dance of the Tumbleweeds"), { modes: [0, 1] });
    expect(zone(game, desert)).toBe("battlefield");
    const [token] = game.battlefield.filter(
      (id) => game.state.objects[id].cardName === "Elemental Token (Dance of the Tumbleweeds)",
    );
    expect(pt(game, token)).toEqual({ power: 7, toughness: 7 });
  });
});

describe("Glimpse the Core", () => {
  it("returns a Cave card from your graveyard to the battlefield tapped", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const cave = toGraveyard(game, "Captivating Cave");
    cast(game, toHand(game, "Glimpse the Core"), { modes: [1], targets: [ref(cave)] });
    expect(zone(game, cave)).toBe("battlefield");
    expect(game.state.objects[cave].tapped).toBe(true);
  });
});

describe("Fear of Burning Alive", () => {
  const delirium = (game: ReturnType<typeof table>["game"]): void => {
    for (const card of ["Wastes", "Grizzly Bears", "Lightning Bolt", "Sol Ring"]) toGraveyard(game, card);
  };

  it("with delirium, its own enters damage sets off the second ability at a creature that player controls", () => {
    const { game, a } = table();
    delirium(game);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    enter(game, "Fear of Burning Alive");
    expect(life(game, B)).toBe(16);
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("without delirium, nothing more happens", () => {
    const { game, a } = table();
    toGraveyard(game, "Wastes");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    enter(game, "Fear of Burning Alive");
    expect(life(game, B)).toBe(16);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("deals the amount the noncombat damage was, to a creature of the opponent dealt it", () => {
    const { game, a } = table({ players: 3 });
    delirium(game);
    spawn(game, "Fear of Burning Alive");
    const bobs = spawn(game, "Hill Giant", B);
    const bobsBears = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Hill Giant", C);
    lands(game, "Mountain", 1);
    const seen: string[] = [];
    a.chooseTargetsFn = (_view, _name, _specs, options) => {
      seen.push(...options[0].map((t) => (t.kind === "object" ? t.object : t.player)));
      return [ref(bobs)];
    };
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(seen).toEqual(expect.arrayContaining([bobs, bobsBears]));
    expect(seen).not.toContain(carols);
    expect(life(game, B)).toBe(17);
    expect(zone(game, bobs)).toBe("graveyard");
    expect(zone(game, carols)).toBe("battlefield");
  });
});

describe("Jackdaw", () => {
  it("may discard its controller's hand to draw a card for each artifact they control", () => {
    const { game, a } = table();
    const jackdaw = spawn(game, "Jackdaw");
    game.debugApplyEffect(A, { kind: "add-types", target: 0, addTypes: ["creature"], duration: "permanent" }, [ref(jackdaw)]);
    spawn(game, "Food Token");
    spawn(game, "Sol Ring");
    const before = [...hand(game, A)];
    expect(before.length).toBeGreaterThan(0);
    pickModes(a, 0);
    attack(game, a, [jackdaw]);
    expect(life(game, B)).toBe(16);
    expect(before.every((id) => graveyard(game, A).includes(id))).toBe(true);
    expect(hand(game, A)).toHaveLength(3);
  });
});
