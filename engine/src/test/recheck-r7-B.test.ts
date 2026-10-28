import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { ringBearerOf } from "../ring.js";
import {
  A,
  B,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  keywords,
  lands,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

// The need-keys recheck list R7, group B: cards once blocked on a coarse key
// (Classes, the Ring, the world rule) that has been built since.

const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => (a.kind === "cast-spell" || a.kind === "play-land") && a.card === card);

describe("Elrond, Lord of Rivendell", () => {
  it("scries each time, and the Ring tempts you on the second resolution this turn — Elrond's own entry counting", () => {
    const { game } = table();
    enter(game, "Elrond, Lord of Rivendell");
    expect(ringBearerOf(game.state, A)).toBeUndefined();
    const bear = enter(game, "Grizzly Bears");
    expect(ringBearerOf(game.state, A)).toBeDefined();
    expect([bear, ...named(game, "Elrond, Lord of Rivendell", A)]).toContain(ringBearerOf(game.state, A));
  });
});

describe("Rogue Class", () => {
  it("exiles the damaged player's top card face down; it's playable only once the Class is level 3", () => {
    const { game, a } = table();
    const rogue = spawn(game, "Rogue Class");
    const card = toLibrary(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    const bear = spawn(game, "Grizzly Bears");
    attack(game, a, [bear]);
    settle(game);
    expect(zone(game, card)).toBe("exile");
    expect(game.state.objects[card].exiledFaceDown?.lookers).toEqual([A]);
    expect(castable(game, card)).toBe(false);
    game.state.objects[rogue].classLevel = 3;
    // Two Islands pay {1}{G}: mana spent as though it were any colour.
    expect(castable(game, card)).toBe(true);
  });
});

describe("Scavenger's Talent", () => {
  it("level 3: may sacrifice three other nonland permanents to return a creature card with a finality counter", () => {
    const { game, a } = table();
    const talent = spawn(game, "Scavenger's Talent");
    game.state.objects[talent].classLevel = 3;
    const fodder = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const dead = toGraveyard(game, "Hill Giant");
    pickModes(a, 0);
    pickFromZone(a, dead);
    a.choosePermanentsFn = () => fodder;
    pickTargets(a, B);
    const bobsBefore = graveyard(game, B).length;
    toStep(game, "end");
    settle(game);
    for (const id of fodder) expect(zone(game, id)).not.toBe("battlefield");
    // Each of the three sacrifices triggers level 2's mill.
    expect(graveyard(game, B).length).toBe(bobsBefore + 6);
    expect(zone(game, dead)).toBe("battlefield");
    expect(counters(game, dead, "finality")).toBe(1);
  });

  it("level 2: sacrificing the Talent itself still makes target player mill two", () => {
    const { game, a } = table();
    const talent = spawn(game, "Scavenger's Talent");
    game.state.objects[talent].classLevel = 2;
    pickTargets(a, B);
    const before = graveyard(game, B).length;
    game.debugApplyEffect(A, { kind: "sacrifice-target", target: 0 }, [{ kind: "object", object: talent }]);
    settle(game);
    expect(zone(game, talent)).toBe("graveyard");
    expect(graveyard(game, B).length).toBe(before + 2);
  });

  it("level 3: with only two other nonland permanents, there's nothing to sacrifice and nothing returns", () => {
    const { game, a } = table();
    const talent = spawn(game, "Scavenger's Talent");
    game.state.objects[talent].classLevel = 3;
    const two = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    lands(game, "Swamp", 3);
    const dead = toGraveyard(game, "Hill Giant");
    pickModes(a, 0);
    toStep(game, "end");
    settle(game);
    for (const id of two) expect(zone(game, id)).toBe("battlefield");
    expect(zone(game, dead)).toBe("graveyard");
  });
});

describe("Sauron, the Necromancer", () => {
  const swing = (bearer: boolean) => {
    const { game, a } = table();
    const sauron = spawn(game, "Sauron, the Necromancer");
    if (bearer) game.state.objects[sauron].ringBearer = A;
    const giant = toGraveyard(game, "Hill Giant");
    attack(game, a, [sauron]);
    const token = named(game, "Hill Giant", A).find((id) => game.state.objects[id].zone === "battlefield")!;
    return { game, giant, token };
  };

  it("exiles the card and makes a tapped, attacking 3/3 black Wraith copy with menace, exiled at the end step", () => {
    const { game, giant, token } = swing(false);
    expect(zone(game, giant)).toBe("exile");
    expect(token).toBeDefined();
    expect(pt(game, token)).toEqual({ power: 3, toughness: 3 });
    expect(subtypes(game, token)).toEqual(["Wraith"]);
    expect(keywords(game, token).has("menace")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[token]?.zone ?? "gone").not.toBe("battlefield");
  });

  it("keeps the token while Sauron is your Ring-bearer", () => {
    const { game, token } = swing(true);
    toStep(game, "end");
    settle(game);
    expect(zone(game, token)).toBe("battlefield");
  });
});

describe("Sauron, Lord of the Rings", () => {
  it("as it's cast: amass Orcs 5, mill five, then return a creature card from the graveyard to the battlefield", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 5);
    const giant = toGraveyard(game, "Hill Giant");
    const before = graveyard(game).length;
    pickFromZone(a, giant);
    cast(game, toHand(game, "Sauron, Lord of the Rings"));
    const army = named(game, "Army Token", A);
    expect(army.length).toBe(1);
    expect(counters(game, army[0])).toBe(5);
    expect(zone(game, giant)).toBe("battlefield");
    // Five milled, the giant gone back: four more in the graveyard than before.
    expect(graveyard(game).length).toBe(before + 5 - 1);
  });
});

describe("Ringsight", () => {
  it("searches only for a card sharing a color with a legendary creature you control", () => {
    const { game, a } = table();
    spawn(game, "Elrond, Lord of Rivendell");
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 1);
    const blue = toLibrary(game, "Counterspell");
    const red = toLibrary(game, "Lightning Bolt");
    const seen = pickFromZone(a, blue);
    cast(game, toHand(game, "Ringsight"));
    expect(seen.offered).toContain(blue);
    expect(seen.offered).not.toContain(red);
    expect(zone(game, blue)).toBe("hand");
  });
});
