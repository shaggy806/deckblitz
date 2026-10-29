/**
 * "Choose a player" (the need-keys `decision:choose-player` family): a player
 * chosen as a permanent enters (rule 614.1c — `choosePlayerOnEnter`) or by an
 * ability as it resolves and kept on it (`choose-opponent { remember }`), then
 * read back as "the chosen player" — a `"chosen-player"` scope, trigger
 * subject, `maxHandSize` and `attackingChosenPlayer` filter — and an opponent
 * chosen among those with the most life (`choose-opponent { mostLife }`).
 */
import { describe, expect, it } from "vitest";

import type { PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  cast,
  hand,
  keywords,
  lands,
  life,
  named,
  pt,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
} from "./harness.js";

describe("choose a player as it enters", () => {
  it("Black Vise asks among the opponents and hits only the chosen one, on their upkeep", () => {
    const { game, a } = table({ players: 3 });
    let offered: readonly string[] = [];
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      offered = options;
      return C;
    };
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Black Vise"));
    expect(offered).toEqual([B, C]);
    const [vise] = named(game, "Black Vise");
    expect(game.state.objects[vise].chosenPlayer).toBe(C);
    expect(game.viewFor(B).objects[vise]?.chosenPlayer).toBe(C);
    for (let i = 0; i < 6; i++) {
      toHand(game, "Wastes", B);
      toHand(game, "Wastes", C);
    }
    toStep(game, "upkeep", B);
    settle(game);
    expect(life(game, B)).toBe(20);
    toStep(game, "upkeep", C);
    settle(game);
    expect(hand(game, C).length).toBeGreaterThan(4);
    expect(life(game, C)).toBe(20 - (hand(game, C).length - 4));
  });

  it("The Rack takes the only opponent without asking, and deals 3 minus their hand", () => {
    const { game, a } = table();
    let asked = false;
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      asked = true;
      return options[0];
    };
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "The Rack"));
    expect(asked).toBe(false);
    const [rack] = named(game, "The Rack");
    expect(game.state.objects[rack].chosenPlayer).toBe(B);
    for (const card of [...hand(game, B)]) game.debugMove(card, "library");
    toStep(game, "upkeep", B);
    settle(game);
    expect(life(game, B)).toBe(17);
  });

  it("Cursed Rack sets only the chosen player's maximum hand size", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    cast(game, toHand(game, "Cursed Rack"));
    for (let i = 0; i < 8; i++) {
      toHand(game, "Wastes", A);
      toHand(game, "Wastes", B);
    }
    const mine = hand(game, A).length;
    toStep(game, "upkeep", B);
    expect(hand(game, A).length).toBe(mine);
    toStep(game, "upkeep", A);
    expect(hand(game, B).length).toBe(4);
  });

  it("Saskia may choose any player, opponents offered first, and redirects each creature's combat damage", () => {
    const { game, a } = table({ players: 3 });
    let offered: readonly string[] = [];
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      offered = options;
      return C;
    };
    for (const land of ["Swamp", "Mountain", "Forest", "Plains"]) lands(game, land, 1);
    cast(game, toHand(game, "Saskia the Unyielding"));
    expect(offered).toEqual([B, C, A]);
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "postcombat-main");
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(life(game, C)).toBe(18);
    expect(life(game, A)).toBe(20);
  });
});

describe("the last chosen player", () => {
  it("Triarch Stalker keeps each combat's choice and gives menace to creatures attacking that player", () => {
    const { game, a } = table({ players: 3 });
    const chooseBy = (who: PlayerId): void => {
      a.chooseModesFn = (_view, _min, _max, texts) => [texts.findIndex((t) => t.toLowerCase().includes(who))];
    };
    const stalker = spawn(game, "Triarch Stalker");
    const toCarol = spawn(game, "Grizzly Bears");
    const toBob = spawn(game, "Grizzly Bears");
    chooseBy(C);
    a.declareAttackersFn = () => [
      { attacker: toCarol, defender: C },
      { attacker: toBob, defender: B },
    ];
    toStep(game, "declare-blockers");
    expect(game.state.objects[stalker].chosenPlayer).toBe(C);
    expect(keywords(game, toCarol).has("menace")).toBe(true);
    expect(keywords(game, toBob).has("menace")).toBe(false);
    expect(keywords(game, stalker).has("menace")).toBe(false);
    // Next turn's choice replaces it.
    toStep(game, "upkeep", B);
    toStep(game, "upkeep", C);
    chooseBy(B);
    a.declareAttackersFn = () => [];
    toStep(game, "postcombat-main", A);
    expect(game.state.objects[stalker].chosenPlayer).toBe(B);
  });

  it("Beckoning Will-o'-Wisp gives +1/+0 to creatures attacking the last chosen player", () => {
    const { game, a } = table();
    spawn(game, "Beckoning Will-o'-Wisp");
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    toStep(game, "declare-blockers");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("an opponent with the most life", () => {
  const setUp = (carolLife: number) => {
    const t = table({ players: 3 });
    t.game.state.players[C].life = carolLife;
    spawn(t.game, "The Master, Gallifrey's End");
    const thopter = spawn(t.game, "Ornithopter");
    return { ...t, thopter };
  };
  const kill = (game: ReturnType<typeof table>["game"], id: string): void => {
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [{ kind: "object", object: id as never }]);
    settle(game);
  };

  it("The Master's opponent is the one with the most life, without asking, and faces the villainous choice", () => {
    const { game, a, c, thopter } = setUp(25);
    let choices = 0;
    a.chooseModesFn = (_view, _min, _max, texts) => {
      if (texts.length > 1) choices += 1;
      return [0];
    };
    c.chooseModesFn = () => [0];
    kill(game, thopter);
    expect(game.state.objects[thopter].zone).toBe("exile");
    expect(choices).toBe(0);
    expect(life(game, C)).toBe(21);
    expect(life(game, B)).toBe(20);
  });

  it("among opponents tied for the most life, its controller chooses", () => {
    const { game, a, c, thopter } = setUp(20);
    let offered: readonly string[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      if (texts.length === 1) return [0];
      offered = texts;
      return [texts.findIndex((t) => t.toLowerCase().includes(C))];
    };
    c.chooseModesFn = () => [1];
    kill(game, thopter);
    expect(offered.length).toBe(2);
    expect(life(game, C)).toBe(20);
    expect(tokensNamed(game, "Ornithopter", A)).toBe(1);
  });
});
