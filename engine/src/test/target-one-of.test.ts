/**
 * One target slot over several kinds of object (`one-of`), the stack target's
 * "that targets you or a creature you control", and exiled cards as targets:
 * by their owner the trigger names, and "exiled this way" on a reflexive ability.
 */
import { describe, expect, it } from "vitest";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { TargetSpec } from "../target.js";
import { describeTargetSpec } from "../target.js";
import { isLegalTarget, legalTargets } from "../targeting.js";
import {
  A,
  activate,
  attack,
  B,
  C,
  cast,
  enter,
  graveyard,
  hand,
  lands,
  life,
  named,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toExile,
  toGraveyard,
  toHand,
  types,
  watchTargets,
  zone,
} from "./harness.js";

const canTarget = (game: Game, object: ObjectId, spec: TargetSpec, player: PlayerId): boolean =>
  isLegalTarget(game.state, game.registry, spec, { kind: "object", object }, player);

const castAtStack = (game: Game, seat: ScriptedController, card: ObjectId, player: PlayerId, target: ObjectId): void => {
  seat.enqueue({ type: "cast-spell", player, card, targets: [{ kind: "object", object: target }] });
  settle(game);
};

/** Alice's Rod of Ruin aimed at `at`, its ability left on the stack. */
const rodAt = (game: Game, at: PlayerId | ObjectId): ObjectId => {
  lands(game, "Wastes", 3);
  const rod = spawn(game, "Rod of Ruin");
  activate(game, rod, 0, { targets: [ref(at)], settle: false });
  return game.state.zones.shared.stack[0];
};

describe("one-of: one slot over several kinds of object", () => {
  const spec: TargetSpec = { kind: "one-of", of: ["spell", "creature"] };

  it("offers each part's candidates, an object two parts accept once", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const forest = spawn(game, "Forest", B);
    const twice: TargetSpec = { kind: "one-of", of: ["creature", { kind: "permanent", filter: { type: "creature" } }] };
    const offered = legalTargets(game.state, game.registry, twice, A);
    expect(offered).toEqual([ref(bears)]);
    expect(canTarget(game, bears, spec, A)).toBe(true);
    expect(canTarget(game, forest, spec, A)).toBe(false);
    expect(describeTargetSpec(spec)).toBe("spell or creature");
  });

  it("is still stopped by hexproof on the permanent part", () => {
    const { game } = table();
    const hexproof = spawn(game, "Gladecover Scout", B);
    expect(canTarget(game, hexproof, spec, A)).toBe(false);
    expect(canTarget(game, hexproof, spec, B)).toBe(true);
  });

  it("can span the graveyard and the battlefield (Daretti's slot)", () => {
    const { game } = table();
    const relic = spawn(game, "Sol Ring", B);
    const dead = toGraveyard(game, "Sol Ring", B);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const slot: TargetSpec = {
      kind: "one-of",
      of: [
        { kind: "card-in-graveyard", filter: { type: "artifact" } },
        { kind: "permanent", filter: { type: "artifact" } },
      ],
    };
    const offered = legalTargets(game.state, game.registry, slot, A);
    expect(offered).toContainEqual(ref(relic));
    expect(offered).toContainEqual(ref(dead));
    expect(offered).not.toContainEqual(ref(bears));
  });

  it("a whole slot can be optional, leaving the choice to skip", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const slot: TargetSpec = { kind: "optional", of: spec };
    expect(legalTargets(game.state, game.registry, slot, A)).toEqual([ref(bears)]);
  });
});

describe("Unsubstantiate", () => {
  it("returns a creature to its owner's hand", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Unsubstantiate"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game, B)).toContain(bears);
  });

  it("returns a spell to its owner's hand: not countered, so the land stays", () => {
    const { game, b } = table();
    lands(game, "Mountain", 3);
    lands(game, "Island", 2, B);
    const land = spawn(game, "Forest", B);
    const rain = toHand(game, "Stone Rain");
    cast(game, rain, { targets: [ref(land)], settle: false });
    castAtStack(game, b, toHand(game, "Unsubstantiate", B), B, rain);
    expect(zone(game, rain)).toBe("hand");
    expect(hand(game, A)).toContain(rain);
    expect(zone(game, land)).toBe("battlefield");
  });

  it("reaches no noncreature permanent and no ability", () => {
    const { game } = table();
    const forest = spawn(game, "Forest", B);
    const ability = rodAt(game, B);
    const spec = game.registry.get("Unsubstantiate").targets[0];
    expect(canTarget(game, forest, spec, B)).toBe(false);
    expect(canTarget(game, ability, spec, B)).toBe(false);
  });
});

describe("Voidslime: a spell, an activated ability or a triggered ability", () => {
  it("counters an activated ability", () => {
    const { game, b } = table();
    lands(game, "Forest", 1, B);
    lands(game, "Island", 2, B);
    const ability = rodAt(game, B);
    castAtStack(game, b, toHand(game, "Voidslime", B), B, ability);
    expect(life(game, B)).toBe(20);
  });

  it("counters a spell", () => {
    const { game, b } = table();
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1, B);
    lands(game, "Island", 2, B);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    castAtStack(game, b, toHand(game, "Voidslime", B), B, bolt);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});

describe("Siren Stormtamer: that targets you or a creature you control", () => {
  const spec = (game: Game): TargetSpec => game.registry.get("Siren Stormtamer").activated[0].targets[0];
  const activateAt = (game: Game, seat: ScriptedController, siren: ObjectId, target: ObjectId): void => {
    seat.enqueue({
      type: "activate-ability",
      player: B,
      source: siren,
      abilityIndex: 0,
      targets: [{ kind: "object", object: target }],
    });
    settle(game);
  };

  it("counters an ability aimed at you, its controller, for {U} and itself", () => {
    const { game, b } = table();
    lands(game, "Island", 1, B);
    const siren = spawn(game, "Siren Stormtamer", B);
    const ability = rodAt(game, B);
    activateAt(game, b, siren, ability);
    expect(life(game, B)).toBe(20);
    expect(graveyard(game, B)).toContain(siren);
  });

  it("counters a spell aimed at a creature you control", () => {
    const { game, b } = table();
    lands(game, "Mountain", 1);
    lands(game, "Island", 1, B);
    const siren = spawn(game, "Siren Stormtamer", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(bears)], settle: false });
    activateAt(game, b, siren, bolt);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("reaches neither what aims at another player or their creature, nor at your own noncreature", () => {
    const { game } = table({ players: 3 });
    const carols = spawn(game, "Grizzly Bears", C);
    const land = spawn(game, "Forest", B);
    lands(game, "Mountain", 3);
    const atCarol = toHand(game, "Lightning Bolt");
    cast(game, atCarol, { targets: [ref(C)], settle: false });
    expect(canTarget(game, atCarol, spec(game), B)).toBe(false);
    expect(canTarget(game, atCarol, spec(game), C)).toBe(true);
    settle(game);
    const atBears = toHand(game, "Lightning Bolt");
    cast(game, atBears, { targets: [ref(carols)], settle: false });
    expect(canTarget(game, atBears, spec(game), B)).toBe(false);
    settle(game);
    const rain = toHand(game, "Stone Rain");
    lands(game, "Mountain", 3);
    cast(game, rain, { targets: [ref(land)], settle: false });
    expect(canTarget(game, rain, spec(game), B)).toBe(false);
  });

  it("a player clause alone still reads only a player", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(bears)], settle: false });
    const you: TargetSpec = { kind: "stack", spells: "any", abilities: true, targeting: { player: "you" } };
    expect(canTarget(game, bolt, you, B)).toBe(false);
  });
});

describe("Tale's End: an ability, or a spell by a filter of its own", () => {
  it("counters an ability, and a legendary spell but no other", () => {
    const { game, b } = table();
    lands(game, "Island", 2, B);
    const ability = rodAt(game, B);
    castAtStack(game, b, toHand(game, "Tale's End", B), B, ability);
    expect(life(game, B)).toBe(20);
    const spec = game.registry.get("Tale's End").targets[0];
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    expect(canTarget(game, bolt, spec, B)).toBe(false);
    settle(game);
    lands(game, "Wastes", 2);
    lands(game, "Forest", 3);
    const legend = toHand(game, "Isamaru, Hound of Konda");
    lands(game, "Plains", 1);
    cast(game, legend, { settle: false });
    expect(canTarget(game, legend, spec, B)).toBe(true);
  });
});

describe("Not of This World: what it counters, and what it costs", () => {
  const offeredCast = (game: Game, card: ObjectId, player: PlayerId): boolean => {
    game.advanceUntil((s) => s.priority.holder === player);
    return game.legalActions(player).some((a) => a.kind === "cast-spell" && a.card === card);
  };

  it("needs {7} for a spell aimed at a smaller permanent of yours", () => {
    const { game, b } = table();
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(bears)], settle: false });
    const card = toHand(game, "Not of This World", B);
    expect(offeredCast(game, card, B)).toBe(false);
    lands(game, "Wastes", 7, B);
    expect(offeredCast(game, card, B)).toBe(true);
    castAtStack(game, b, card, B, bolt);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].tapped).length).toBe(8);
  });

  it("is free against what aims at your creature of power 7 or more", () => {
    const { game, b } = table();
    lands(game, "Mountain", 1);
    const ghalta = spawn(game, "Ghalta, Primal Hunger", B);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(ghalta)], settle: false });
    const card = toHand(game, "Not of This World", B);
    expect(offeredCast(game, card, B)).toBe(true);
    castAtStack(game, b, card, B, bolt);
    expect(zone(game, bolt)).toBe("graveyard");
  });

  it("can't be aimed at what aims only at you", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    const spec = game.registry.get("Not of This World").targets[0];
    expect(canTarget(game, bolt, spec, B)).toBe(false);
  });
});

describe("Sorceress's Schemes: one slot over two zones", () => {
  it("returns an instant or sorcery from your graveyard, and adds {R}", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const bolt = toGraveyard(game, "Lightning Bolt");
    cast(game, toHand(game, "Sorceress's Schemes"), { targets: [ref(bolt)] });
    expect(zone(game, bolt)).toBe("hand");
  });

  it("returns an exiled card with flashback you own", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const exiled = toExile(game, "Sorceress's Schemes");
    cast(game, toHand(game, "Sorceress's Schemes"), { targets: [ref(exiled)] });
    expect(zone(game, exiled)).toBe("hand");
  });

  it("offers neither someone else's cards, nor an exiled card with no flashback, nor another type", () => {
    const { game } = table();
    const spec = game.registry.get("Sorceress's Schemes").targets[0];
    const yours = toGraveyard(game, "Lightning Bolt");
    const creature = toGraveyard(game, "Grizzly Bears");
    const theirs = toGraveyard(game, "Lightning Bolt", B);
    const plainExile = toExile(game, "Lightning Bolt");
    const theirExile = toExile(game, "Sorceress's Schemes", B);
    expect(canTarget(game, yours, spec, A)).toBe(true);
    expect(canTarget(game, creature, spec, A)).toBe(false);
    expect(canTarget(game, theirs, spec, A)).toBe(false);
    expect(canTarget(game, plainExile, spec, A)).toBe(false);
    expect(canTarget(game, theirExile, spec, A)).toBe(false);
  });
});

describe("Riftsweeper: its owner shuffles a face-up exiled card in", () => {
  it("takes anyone's exiled card to its owner's library", () => {
    const { game, a } = table();
    const exiled = toExile(game, "Grizzly Bears", B);
    pickTargets(a, exiled);
    enter(game, "Riftsweeper");
    settle(game);
    expect(zone(game, exiled)).toBe("library");
    expect(game.state.zones.perPlayer[B].library).toContain(exiled);
  });

  it("does nothing with nothing in exile", () => {
    const { game } = table();
    const sweeper = enter(game, "Riftsweeper");
    settle(game);
    expect(zone(game, sweeper)).toBe("battlefield");
  });
});

describe("Time Reaper: a face-up card the damaged player owns in exile", () => {
  it("puts that player's card on the bottom of their library, and you gain 3", () => {
    const { game, a } = table({ players: 3 });
    const reaper = spawn(game, "Time Reaper");
    const theirs = toExile(game, "Grizzly Bears", B);
    const theirOther = toExile(game, "Forest", B);
    toExile(game, "Grizzly Bears");
    toExile(game, "Grizzly Bears", C);
    const seen = watchTargets(a, () => [theirs]);
    attack(game, a, [reaper]);
    expect(seen.offered[0]).toEqual([theirs, theirOther]);
    const library = game.state.zones.perPlayer[B].library;
    expect(library[library.length - 1]).toBe(theirs);
    expect(life(game)).toBe(23);
    expect(life(game, B)).toBe(16);
  });

  it("with no such card the trigger never goes on the stack", () => {
    const { game, a } = table();
    const reaper = spawn(game, "Time Reaper");
    toExile(game, "Grizzly Bears");
    attack(game, a, [reaper]);
    expect(life(game)).toBe(20);
  });
});

describe("Espers to Magicite: a target exiled this way, chosen after the spell is done", () => {
  it("offers only the creature cards it exiled, and copies one as an artifact", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Swamp", 4);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const dreadmaw = toGraveyard(game, "Colossal Dreadmaw", C);
    const forest = toGraveyard(game, "Forest", B);
    const mine = toGraveyard(game, "Grizzly Bears");
    const already = toExile(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [dreadmaw]);
    cast(game, toHand(game, "Espers to Magicite"), {});
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).toContain(dreadmaw);
    expect(seen.offered[0]).not.toContain(forest);
    expect(seen.offered[0]).not.toContain(already);
    expect(seen.offered[0]).not.toContain(mine);
    expect(zone(game, mine)).toBe("graveyard");
    const token = named(game, "Colossal Dreadmaw", A);
    expect(token.length).toBe(1);
    expect(types(game, token[0])).toEqual(["artifact"]);
  });

  it("may choose no target", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, null);
    cast(game, toHand(game, "Espers to Magicite"), {});
    expect(zone(game, bears)).toBe("exile");
    expect(named(game, "Grizzly Bears", A).length).toBe(0);
  });

  it("isn't reached by anyone but its reflexive slot: unbound, it matches nothing", () => {
    const { game } = table();
    const exiled = toExile(game, "Grizzly Bears", B);
    const unbound: TargetSpec = { kind: "card-in-exile", thisWay: "exiled" };
    expect(canTarget(game, exiled, unbound, A)).toBe(false);
  });
});
