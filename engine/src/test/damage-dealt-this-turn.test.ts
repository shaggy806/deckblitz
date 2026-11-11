/**
 * Damage dealt this turn read by what dealt it and what took it (the turn's
 * `damageDealt` record): to this creature (the Zubera's "if 4 or more damage was
 * dealt to it", Blazing Effigy's "by other sources named"), to you by artifacts
 * (Reverse Polarity), by one spell (Backdraft).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  cast,
  destroy,
  hand,
  lands,
  life,
  nextTurn,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
  toStep,
  zone,
} from "./harness.js";

/** Cast `name` at `target`, the lands for it already out. */
const burn = (game: Game, name: string, target: ObjectId | PlayerId, by: PlayerId = A): ObjectId => {
  const spell = toHand(game, name, by);
  cast(game, spell, { player: by, targets: [ref(target)] });
  return spell;
};

describe("the Zubera: if 4 or more damage was dealt to it this turn", () => {
  it("one big hit: three cards", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const zubera = spawn(game, "Rushing-Tide Zubera", B);
    const before = hand(game, B).length;
    burn(game, "Flame Slash", zubera);
    expect(zone(game, zubera)).toBe("graveyard");
    // Rushing-Tide says "draw", its controller's.
    expect(hand(game, B).length).toBe(before + 3);
  });

  it("3 is not enough, though it dies", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const zubera = spawn(game, "Rushing-Tide Zubera", B);
    const before = hand(game, B).length;
    burn(game, "Lightning Bolt", zubera);
    expect(zone(game, zubera)).toBe("graveyard");
    expect(hand(game, B).length).toBe(before);
  });

  it("adds up over several sources and controllers", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const zubera = spawn(game, "Rushing-Tide Zubera", B);
    const before = hand(game, B).length;
    // Bigger, so the first two don't kill it.
    game.state.objects[zubera].counters["+1/+1"] = 3;
    burn(game, "Lightning Bolt", zubera);
    burn(game, "Shock", zubera);
    expect(zone(game, zubera)).toBe("battlefield");
    burn(game, "Lightning Bolt", zubera);
    expect(zone(game, zubera)).toBe("graveyard");
    expect(hand(game, B).length).toBe(before + 3);
  });

  it("damage it took before it last left isn't to it (rule 400.7)", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const zubera = spawn(game, "Rushing-Tide Zubera", B);
    burn(game, "Shock", zubera);
    // Back through a zone as a new object.
    game.debugMove(zubera, "hand");
    game.debugMove(zubera, "battlefield");
    settle(game);
    const before = hand(game, B).length;
    burn(game, "Lightning Bolt", zubera);
    expect(zone(game, zubera)).toBe("graveyard");
    expect(hand(game, B).length).toBe(before);
  });

  it("damage prevented wasn't dealt", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const zubera = spawn(game, "Rushing-Tide Zubera", B);
    const before = hand(game, B).length;
    // A shield counter prevents the first hit (rule 122.1c).
    game.state.objects[zubera].counters.shield = 1;
    burn(game, "Flame Slash", zubera);
    expect(zone(game, zubera)).toBe("battlefield");
    burn(game, "Lightning Bolt", zubera);
    expect(zone(game, zubera)).toBe("graveyard");
    expect(hand(game, B).length).toBe(before);
  });

  it("Burning-Eye deals its 3 only past the 4", () => {
    const { game, b } = table();
    lands(game, "Mountain", 2);
    const zubera = spawn(game, "Burning-Eye Zubera", B);
    pickTargets(b, A);
    const was = life(game, A);
    burn(game, "Flame Slash", zubera);
    expect(life(game, A)).toBe(was - 3);
  });

  it("Burning-Eye with less isn't even put on the stack, so asks no target", () => {
    const { game, b } = table();
    lands(game, "Mountain", 1);
    const zubera = spawn(game, "Burning-Eye Zubera", B);
    let asked = 0;
    b.chooseTargetsFn = () => {
      asked += 1;
      return [null];
    };
    burn(game, "Lightning Bolt", zubera);
    expect(zone(game, zubera)).toBe("graveyard");
    expect(asked).toBe(0);
  });
});

describe("Blazing Effigy", () => {
  it("3 alone", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const effigy = spawn(game, "Blazing Effigy", A);
    const victim = spawn(game, "Colossal Dreadmaw", B);
    pickTargets(a, victim);
    burn(game, "Lightning Bolt", effigy);
    expect(game.state.objects[victim].damageMarked).toBe(3);
  });

  it("adds what another Effigy dealt it, and not other sources' damage", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const first = spawn(game, "Blazing Effigy", A);
    const second = spawn(game, "Blazing Effigy", A);
    const third = spawn(game, "Blazing Effigy", A);
    const big = spawn(game, "Colossal Dreadmaw", B); // 6/6, made 8/8: 6 won't kill it
    game.state.objects[big].counters["+1/+1"] = 2;
    let trigger = 0;
    a.chooseTargetsFn = () => {
      trigger += 1;
      return [ref(trigger === 1 ? second : trigger === 2 ? third : big)];
    };
    burn(game, "Lightning Bolt", first);
    // Bolt kills the first: 3 to the second, which dies: 3 + 3 to the third,
    // which dies: 3 + 6 to the Dreadmaw.
    expect(zone(game, second)).toBe("graveyard");
    expect(zone(game, third)).toBe("graveyard");
    expect(zone(game, big)).toBe("graveyard");
    // The last had one creature left to aim at: not asked.
    expect(trigger).toBe(2);
  });

  it("a Bolt's damage to the second doesn't count", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const second = spawn(game, "Blazing Effigy", A);
    const victim = spawn(game, "Colossal Dreadmaw", B);
    pickTargets(a, victim);
    burn(game, "Lightning Bolt", second);
    expect(game.state.objects[victim].damageMarked).toBe(3);
  });
});

describe("Tangled Colony: a Rat for each damage dealt to it this turn", () => {
  it("counts all of one hit, past lethal", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const colony = spawn(game, "Tangled Colony", B);
    burn(game, "Lightning Bolt", colony);
    expect(zone(game, colony)).toBe("graveyard");
    expect(tokensNamed(game, "Rat Token (Can't Block)", B)).toBe(3);
  });

  it("adds up the turn's hits from every source, and none if it dies undamaged", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const colony = spawn(game, "Tangled Colony", B);
    game.state.objects[colony].counters["+1/+1"] = 3; // 6/5
    burn(game, "Shock", colony);
    burn(game, "Lightning Bolt", colony);
    expect(zone(game, colony)).toBe("graveyard");
    expect(tokensNamed(game, "Rat Token (Can't Block)", B)).toBe(5);

    const other = spawn(game, "Tangled Colony", A);
    destroy(game, other);
    expect(tokensNamed(game, "Rat Token (Can't Block)", A)).toBe(0);
  });

  it("an earlier turn's damage isn't this turn's", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const colony = spawn(game, "Tangled Colony", B);
    game.state.objects[colony].counters["+1/+1"] = 2; // 5/4
    burn(game, "Lightning Bolt", colony);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, colony)).toBe("battlefield");
    lands(game, "Mountain", 1);
    game.state.objects[colony].counters["+1/+1"] = 0;
    burn(game, "Shock", colony);
    expect(zone(game, colony)).toBe("graveyard");
    expect(tokensNamed(game, "Rat Token (Can't Block)", B)).toBe(2);
  });

  it("combat damage counts: blocked by a 6/6, six Rats", () => {
    const { game, a, b } = table();
    const colony = spawn(game, "Tangled Colony", A);
    const maw = spawn(game, "Colossal Dreadmaw", B);
    a.declareAttackersFn = () => [{ attacker: colony, defender: B }];
    b.declareBlockersFn = () => [{ blocker: maw, attacker: colony }];
    toStep(game, "postcombat-main");
    expect(zone(game, colony)).toBe("graveyard");
    expect(tokensNamed(game, "Rat Token (Can't Block)", A)).toBe(6);
  });
});

describe("Reverse Polarity", () => {
  it("twice what artifacts dealt you, no one else's and nothing else's", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    lands(game, "Mountain", 1);
    const rod = spawn(game, "Rod of Ruin", A);
    activate(game, rod, 0, { targets: [ref(A)] });
    settle(game);
    // Not an artifact: doesn't count.
    burn(game, "Shock", A);
    const was = life(game, A);
    cast(game, toHand(game, "Reverse Polarity"));
    expect(life(game, A)).toBe(was + 2);
  });

  it("nothing dealt: gains nothing", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const was = life(game, A);
    cast(game, toHand(game, "Reverse Polarity"));
    expect(life(game, A)).toBe(was);
  });
});

describe("Backdraft", () => {
  const sorcery = (game: Game, by: PlayerId): ObjectId => {
    // Flame Rift deals 4 to each player, a sorcery.
    const spell = toHand(game, "Flame Rift", by);
    cast(game, spell, { player: by });
    return spell;
  };

  it("half the damage the player's sorcery dealt, rounded down, asking no one with one choice", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    // Alice cast it, and she is the only one who did: she's "that player".
    sorcery(game, A);
    a.chooseModesFn = () => {
      throw new Error("nothing to choose");
    };
    const was = life(game, A);
    const other = life(game, B);
    cast(game, toHand(game, "Backdraft"));
    // Flame Rift dealt 8 in all, 4 to each.
    expect(life(game, A)).toBe(was - 4);
    expect(life(game, B)).toBe(other);
  });

  it("nobody cast a sorcery: nothing", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const was = life(game, A);
    const other = life(game, B);
    burn(game, "Lightning Bolt", B);
    cast(game, toHand(game, "Backdraft"));
    expect(life(game, A)).toBe(was);
    expect(life(game, B)).toBe(other - 3);
  });

  it("of two sorceries you choose which, by what each dealt", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    lands(game, "Swamp", 2);
    sorcery(game, A);
    // A sorcery that dealt nothing.
    cast(game, toHand(game, "Sign in Blood"), { targets: [ref(B)] });
    const was = life(game, A);
    let offered: readonly string[] = [];
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      offered = options;
      return options.find((o) => o.startsWith("Flame Rift")) as string;
    };
    cast(game, toHand(game, "Backdraft"));
    expect(offered).toEqual(["Flame Rift: 8 damage", "Sign in Blood: 0 damage"]);
    expect(life(game, A)).toBe(was - 4);
  });

  it("chooses among those players, by a card that isn't a target", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Mountain", 4);
    sorcery(game, A);
    // Carol cast it too, somehow; Bob cast nothing.
    game.state.players[C].spellsCastThisTurnAs = [...(game.state.players[A].spellsCastThisTurnAs ?? [])];
    let offered: readonly string[] = [];
    a.chooseModesFn = (view) => {
      const awaiting = view.state.awaiting;
      offered = awaiting?.kind === "choose-modes" ? awaiting.modes.map((mode) => mode.text) : [];
      return [1];
    };
    const was = life(game, C);
    cast(game, toHand(game, "Backdraft"));
    expect(offered).toEqual(["Choose Alice", "Choose Carol"]);
    // Flame Rift dealt 12 at three players; half of it, rounded down.
    expect(life(game, C)).toBe(was - 6);
  });
});
